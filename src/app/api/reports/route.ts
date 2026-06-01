import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "inventory";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const departmentId = searchParams.get("departmentId") || "";

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let data: any = {};

    switch (type) {
      case "inventory": {
        const where: any = { deletedAt: null };
        if (departmentId) where.departmentId = departmentId;
        if (startDate || endDate) where.createdAt = dateFilter;

        const items = await prisma.inventoryItem.findMany({
          where,
          include: {
            department: { select: { name: true } },
            assignments: {
              where: { returnedAt: null },
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = {
          title: "Inventory Summary Report",
          generatedAt: new Date().toISOString(),
          totalItems: items.length,
          items: items.map((item) => ({
            propertyNumber: item.propertyNumber,
            itemName: item.itemName,
            category: item.category,
            status: item.status,
            department: item.department?.name || "N/A",
            assignedTo: item.assignments[0]?.user?.name || "N/A",
            purchaseDate: item.purchaseDate?.toISOString() || "N/A",
            purchaseCost: item.purchaseCost?.toString() || "N/A",
          })),
        };
        break;
      }

      case "consumables": {
        const where: any = { deletedAt: null };
        if (departmentId) where.departmentId = departmentId;

        const items = await prisma.consumableItem.findMany({
          where,
          include: {
            department: { select: { name: true } },
            stockMovements: {
              where: startDate || endDate ? { createdAt: dateFilter } : {},
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = {
          title: "Consumable Usage Report",
          generatedAt: new Date().toISOString(),
          totalItems: items.length,
          items: items.map((item) => ({
            propertyNumber: item.propertyNumber,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity,
            unitType: item.unitType,
            reorderLevel: item.reorderLevel,
            department: item.department?.name || "N/A",
            expirationDate: item.expirationDate?.toISOString() || "N/A",
            totalMovements: item.stockMovements.length,
          })),
        };
        break;
      }

      case "requests": {
        const where: any = {};
        if (departmentId) where.consumableItem = { departmentId };
        if (startDate || endDate) where.createdAt = dateFilter;

        const requests = await prisma.consumableRequest.findMany({
          where,
          include: {
            consumableItem: { select: { itemName: true } },
            requester: { select: { name: true, email: true } },
            approver: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        data = {
          title: "Request History Report",
          generatedAt: new Date().toISOString(),
          totalRequests: requests.length,
          requests: requests.map((req) => ({
            requestNumber: req.requestNumber,
            itemName: req.consumableItem.itemName,
            requester: req.requester.name || req.requester.email,
            quantity: req.quantity,
            status: req.status,
            priority: req.priority,
            approvedBy: req.approver?.name || "N/A",
            createdAt: req.createdAt.toISOString(),
          })),
        };
        break;
      }

      case "low-stock": {
        const where: any = {
          deletedAt: null,
          quantity: { lte: prisma.consumableItem.fields.reorderLevel },
        };
        if (departmentId) where.departmentId = departmentId;

        const items = await prisma.consumableItem.findMany({
          where,
          include: { department: { select: { name: true } } },
          orderBy: { quantity: "asc" },
        });

        data = {
          title: "Low Stock Report",
          generatedAt: new Date().toISOString(),
          totalItems: items.length,
          items: items.map((item) => ({
            propertyNumber: item.propertyNumber,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity,
            reorderLevel: item.reorderLevel,
            criticalLevel: item.criticalLevel,
            department: item.department?.name || "N/A",
          })),
        };
        break;
      }

      case "expiry": {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const where: any = {
          deletedAt: null,
          expirationDate: { lte: thirtyDaysFromNow },
        };
        if (departmentId) where.departmentId = departmentId;

        const items = await prisma.consumableItem.findMany({
          where,
          include: { department: { select: { name: true } } },
          orderBy: { expirationDate: "asc" },
        });

        data = {
          title: "Expiration Report",
          generatedAt: new Date().toISOString(),
          totalItems: items.length,
          items: items.map((item) => ({
            propertyNumber: item.propertyNumber,
            itemName: item.itemName,
            category: item.category,
            batchNumber: item.batchNumber || "N/A",
            expirationDate: item.expirationDate?.toISOString() || "N/A",
            daysRemaining: item.expirationDate
              ? Math.ceil((item.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              : "N/A",
            department: item.department?.name || "N/A",
          })),
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}