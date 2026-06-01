import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalDepartments,
      totalInventory,
      assignedInventory,
      totalConsumables,
      lowStockCount,
      expiredCount,
      nearExpiryCount,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,
      recentStockMovements,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.department.count(),
      prisma.inventoryItem.count({ where: { deletedAt: null } }),
      prisma.inventoryItem.count({ where: { status: "ASSIGNED", deletedAt: null } }),
      prisma.consumableItem.count({ where: { deletedAt: null } }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          quantity: { lte: prisma.consumableItem.fields.reorderLevel }, // <-- FIXED
        },
      }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          expirationDate: { lte: today },
        },
      }),
      prisma.consumableItem.count({
        where: {
          deletedAt: null,
          expirationDate: { gt: today, lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.consumableRequest.count(),
      prisma.consumableRequest.count({ where: { status: "PENDING" } }),
      prisma.consumableRequest.count({ where: { status: "APPROVED" } }),
      prisma.consumableRequest.count({ where: { status: "REJECTED" } }),
      prisma.consumableRequest.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.stockMovement.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers },
      departments: totalDepartments,
      inventory: { total: totalInventory, assigned: assignedInventory },
      consumables: {
        total: totalConsumables,
        lowStock: lowStockCount,
        expired: expiredCount,
        nearExpiry: nearExpiryCount,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        recent: recentRequests,
      },
      activity: {
        recentRequests,
        recentStockMovements,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}