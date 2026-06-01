// src/app/api/my-inventory/[id]/route.ts
//
// GET  — detail of one UserConsumableInventory entry + full distribution history
// POST — record a distribution / use / transfer and deduct quantity

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const distributeSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  type: z.enum(["DISTRIBUTED", "USED", "TRANSFERRED"]),
  recipientName: z.string().max(100).optional().nullable(),
  recipientDept: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entry = await prisma.userConsumableInventory.findUnique({
      where: { id: params.id },
      include: {
        consumableItem: {
          select: {
            itemName: true,
            category: true,
            unitType: true,
            expirationDate: true,
            description: true,
            department: { select: { name: true } },
          },
        },
        distributions: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Regular users can only access their own inventory
    if (session.user.role === "USER" && entry.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: entry.id,
      userId: entry.userId,
      userName: entry.user.name,
      userEmail: entry.user.email,
      consumableItemId: entry.consumableItemId,
      quantity: entry.quantity,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      // Consumable item fields
      itemName: entry.consumableItem.itemName,
      category: entry.consumableItem.category,
      unitType: entry.consumableItem.unitType,
      expirationDate: entry.consumableItem.expirationDate,
      description: entry.consumableItem.description,
      departmentName: entry.consumableItem.department?.name || null,
      // Distribution history
      distributions: entry.distributions,
    });
  } catch (error) {
    console.error("My-inventory detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory detail" },
      { status: 500 }
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
// Record a distribution / use / transfer from the user's personal stock
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = distributeSchema.parse(body);

    const entry = await prisma.userConsumableInventory.findUnique({
      where: { id: params.id },
      include: {
        consumableItem: { select: { itemName: true, unitType: true } },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Users can only distribute from their own inventory
    if (session.user.role === "USER" && entry.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (entry.quantity < validated.quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock. You have ${entry.quantity} ${entry.consumableItem.unitType} remaining.`,
        },
        { status: 400 }
      );
    }

    const newQuantity = entry.quantity - validated.quantity;

    // ✅ Deduct from user's personal inventory
    await prisma.userConsumableInventory.update({
      where: { id: params.id },
      data: { quantity: newQuantity },
    });

    // ✅ Record the distribution event
    const distribution = await prisma.userDistribution.create({
      data: {
        inventoryId: params.id,
        performedBy: session.user.id,
        quantity: validated.quantity,
        type: validated.type,
        recipientName: validated.recipientName ?? null,
        recipientDept: validated.recipientDept ?? null,
        location: validated.location ?? null,
        notes: validated.notes ?? null,
      },
    });

    // ✅ Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `ITEM_${validated.type}`,
        entityType: "USER_INVENTORY",
        entityId: params.id,
        newValues: {
          itemName: entry.consumableItem.itemName,
          quantityMoved: validated.quantity,
          type: validated.type,
          recipientName: validated.recipientName,
          recipientDept: validated.recipientDept,
          location: validated.location,
          remainingQuantity: newQuantity,
        },
      },
    });

    return NextResponse.json(
      { distribution, remainingQuantity: newQuantity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Distribution error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to record distribution" },
      { status: 500 }
    );
  }
}