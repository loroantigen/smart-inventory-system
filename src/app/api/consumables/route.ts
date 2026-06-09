export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumableItemSchema } from "@/lib/zod-schemas";
import { generatePropertyNumber, getDaysUntilExpiration } from "@/lib/utils";

// Serialize Prisma records (DateTime, Decimal, etc.) to plain JSON-safe objects
const toAuditJson = (data: any) => JSON.parse(JSON.stringify(data));

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const nearExpiry = searchParams.get("nearExpiry") === "true";
    const expired = searchParams.get("expired") === "true";

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { propertyNumber: { contains: search, mode: "insensitive" } },
        { itemName: { contains: search, mode: "insensitive" } },
        { batchNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (departmentId) where.departmentId = departmentId;

    const [items, total] = await Promise.all([
      prisma.consumableItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: { select: { name: true } },
          _count: { select: { stockMovements: true, requests: true } },
        },
      }),
      prisma.consumableItem.count({ where }),
    ]);

    const formattedItems = items.map((item) => {
      const daysUntilExpiry = getDaysUntilExpiration(item.expirationDate);
      const isLowStock = item.quantity <= item.reorderLevel;
      const isCritical = item.quantity <= item.criticalLevel;
      const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
      const isNearExpiry =
        daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

      return {
        ...item,
        departmentName: item.department?.name || null,
        daysUntilExpiry,
        isLowStock,
        isCritical,
        isExpired,
        isNearExpiry,
        movementCount: item._count.stockMovements,
        requestCount: item._count.requests,
      };
    });

    let filteredItems = formattedItems;
    if (nearExpiry) filteredItems = formattedItems.filter((i) => i.isNearExpiry);
    if (expired) filteredItems = formattedItems.filter((i) => i.isExpired);

    return NextResponse.json({
      items: filteredItems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Consumables fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consumables" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // FIX 1: Convert empty departmentId string to undefined so Prisma
    // doesn't attempt a FK lookup on an empty string (causes constraint error)
    if (body.departmentId === "") body.departmentId = undefined;

    const validated = consumableItemSchema.parse(body);

    const propertyNumber =
      validated.propertyNumber || generatePropertyNumber("CON");

    const item = await prisma.consumableItem.create({
      data: {
        ...validated,
        propertyNumber,
        // Ensure dates are real Date objects even if the client sent ISO strings
        expirationDate: validated.expirationDate
          ? new Date(validated.expirationDate)
          : null,
        dateReceived: validated.dateReceived
          ? new Date(validated.dateReceived)
          : null,
        // Ensure empty departmentId doesn't reach Prisma as an empty string
        departmentId: validated.departmentId || null,
      },
    });

    if (validated.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          consumableItemId: item.id,
          type: "STOCK_IN",
          quantity: validated.quantity,
          previousQuantity: 0,
          newQuantity: validated.quantity,
          reason: "Initial stock",
          performedBy: session.user.id,
        },
      });
    }

    // FIX 2: Serialize the Prisma record with toAuditJson before storing in
    // the Json column — raw Prisma objects contain DateTime instances that
    // Prisma cannot store in a Json field, causing a 500 on audit log creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONSUMABLE_CREATED",
        entityType: "CONSUMABLE_ITEM",
        entityId: item.id,
        newValues: toAuditJson(item),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Consumable create error:", error);

    // Surface Zod validation errors clearly instead of a generic 500
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", issues: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create consumable item" },
      { status: 500 }
    );
  }
}