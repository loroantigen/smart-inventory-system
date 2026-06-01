import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod"; // <-- ADD THIS IMPORT
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inventoryItemSchema } from "@/lib/zod-schemas";
import { generatePropertyNumber } from "@/lib/utils";

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
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { propertyNumber: { contains: search, mode: "insensitive" } },
        { itemName: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (departmentId) where.departmentId = departmentId;

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: { select: { name: true } },
          assignments: {
            where: { returnedAt: null },
            include: { user: { select: { name: true, email: true } } },
            take: 1,
          },
          _count: { select: { documents: true } },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      ...item,
      departmentName: item.department?.name || null,
      assignedUserName: item.assignments[0]?.user?.name || null,
      assignedUserEmail: item.assignments[0]?.user?.email || null,
      documentCount: item._count.documents,
    }));

    return NextResponse.json({
      items: formattedItems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
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
    console.log("API received:", body);

    const validated = inventoryItemSchema.parse(body);
    console.log("Zod validated:", validated);

    const propertyNumber = validated.propertyNumber?.trim() || generatePropertyNumber("INV");

    // FIX: Verify departmentId exists before saving (prevents foreign key crash)
    let departmentId = validated.departmentId;
    if (departmentId) {
      const deptExists = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { id: true },
      });
      if (!deptExists) {
        console.warn(`Department ${departmentId} not found, setting to null`);
        departmentId = undefined;
      }
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...validated,
        propertyNumber,
        departmentId, // Safe: either real UUID or undefined
        purchaseCost: validated.purchaseCost != null ? Number(validated.purchaseCost) : null,
        purchaseDate: validated.purchaseDate ? new Date(validated.purchaseDate) : null,
        warrantyExpiration: validated.warrantyExpiration ? new Date(validated.warrantyExpiration) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "INVENTORY_CREATED",
        entityType: "INVENTORY_ITEM",
        entityId: item.id,
        newValues: item,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Inventory create error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}