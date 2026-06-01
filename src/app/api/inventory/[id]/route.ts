import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inventoryItemSchema } from "@/lib/zod-schemas";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
      include: {
        department: { select: { name: true } },
        assignments: {
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { assignedAt: "desc" },
        },
        documents: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      departmentName: item.department?.name || null,
    });
  } catch (error) {
    console.error("Inventory detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // ✅ Extract assignedTo BEFORE Zod parsing — it's not in inventoryItemSchema
    // so Zod would silently strip it otherwise
    const assignedTo: string | null = body.assignedTo || null;
    delete body.assignedTo;

    const validated = inventoryItemSchema.partial().parse(body);

    const cleanData: any = {};

    for (const [key, value] of Object.entries(validated)) {
      if (typeof value === "string" && value.trim() === "") {
        cleanData[key] = undefined;
      } else {
        cleanData[key] = value;
      }
    }

    if (cleanData.purchaseCost != null) {
      cleanData.purchaseCost = Number(cleanData.purchaseCost);
    }

    if (cleanData.purchaseDate) {
      cleanData.purchaseDate = new Date(cleanData.purchaseDate);
    }

    if (cleanData.warrantyExpiration) {
      cleanData.warrantyExpiration = new Date(cleanData.warrantyExpiration);
    }

    const oldItem = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!oldItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: cleanData,
    });

    // ✅ Sync the InventoryAssignment table
    // Close any currently open assignment first
    await prisma.inventoryAssignment.updateMany({
      where: { inventoryItemId: params.id, returnedAt: null },
      data: { returnedAt: new Date() },
    });

    // Create a new assignment if a user was selected
    if (assignedTo) {
      await prisma.inventoryAssignment.create({
        data: {
          inventoryItemId: params.id,
          userId: assignedTo,
          assignedBy: session.user.id, // ✅ required field in schema
          assignedAt: new Date(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "INVENTORY_UPDATED",
        entityType: "INVENTORY_ITEM",
        entityId: params.id,
        oldValues: oldItem,
        newValues: item,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Inventory update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map(
            (e) => `${e.path.join(".")}: ${e.message}`
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Soft delete only — data is never lost
    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "INVENTORY_ARCHIVED",
        entityType: "INVENTORY_ITEM",
        entityId: params.id,
        oldValues: item,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory archive error:", error);
    return NextResponse.json({ error: "Failed to archive item" }, { status: 500 });
  }
}