import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalInventory,
      totalConsumables,
      assignedEquipment,
      pendingRequests,
      approvedRequests,
      lowStockItems,
      nearExpiryItems,
      expiredItems,
    ] = await Promise.all([
      prisma.inventoryItem.count({ where: { deletedAt: null } }),
      prisma.consumableItem.count({ where: { deletedAt: null } }),
      prisma.inventoryItem.count({ where: { status: "ASSIGNED", deletedAt: null } }),
      prisma.consumableRequest.count({ where: { status: "PENDING" } }),
      prisma.consumableRequest.count({ where: { status: "APPROVED" } }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          quantity: { lte: prisma.consumableItem.fields.reorderLevel },
        },
      }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          expirationDate: { lte: thirtyDaysFromNow, gt: today },
        },
      }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          expirationDate: { lte: today },
        },
      }),
    ]);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, "MMM yyyy"),
      });
    }

    const monthlyUsage = await Promise.all(
      months.map(async (month) => {
        const stockIn = await prisma.stockMovement.count({
          where: {
            type: "STOCK_IN",
            createdAt: { gte: month.start, lte: month.end },
          },
        });
        const stockOut = await prisma.stockMovement.count({
          where: {
            type: "STOCK_OUT",
            createdAt: { gte: month.start, lte: month.end },
          },
        });
        return { month: month.label, stockIn, stockOut };
      })
    );

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { inventoryItems: true, consumableItems: true },
        },
      },
    });

    const departmentStats = departments.map((dept) => ({
      departmentName: dept.name,
      inventoryCount: dept._count.inventoryItems,
      consumableCount: dept._count.consumableItems,
      assignedCount: 0,
    }));

    const recentActivities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const formattedActivities = recentActivities.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityName: log.entityId,
      userName: log.user?.name || "System",
      createdAt: log.createdAt,
    }));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return { date, label: format(date, "EEE") };
    });

    const requestTrends = await Promise.all(
      last7Days.map(async (day) => {
        const count = await prisma.consumableRequest.count({
          where: {
            createdAt: {
              gte: day.date,
              lt: new Date(day.date.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });
        return { day: day.label, requests: count };
      })
    );

    return NextResponse.json({
      stats: {
        totalInventory,
        totalConsumables,
        lowStockItems,
        nearExpiryItems,
        expiredItems,
        pendingRequests,
        approvedRequests,
        assignedEquipment,
      },
      monthlyUsage,
      departmentStats,
      recentActivities: formattedActivities,
      requestTrends,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}