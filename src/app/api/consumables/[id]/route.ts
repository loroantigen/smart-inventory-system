import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: convert Prisma record to plain JSON-safe object
const toAuditJson = (data: any) => JSON.parse(JSON.stringify(data));

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.consumableItem.findUnique({
      where: { id: params.id },
      include: {
        department: { select: { name: true } },
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: { select: { name: true } },
          },
        },
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
    console.error("Consumable detail error:", error);
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
    const oldItem = await prisma.consumableItem.findUnique({
      where: { id: params.id },
    });

    const item = await prisma.consumableItem.update({
      where: { id: params.id },
      data: body,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONSUMABLE_UPDATED",
        entityType: "CONSUMABLE_ITEM",
        entityId: params.id,
        oldValues: oldItem ? toAuditJson(oldItem) : null, // <-- FIXED
        newValues: toAuditJson(item),                      // <-- FIXED
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Consumable update error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.consumableItem.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONSUMABLE_DELETED",
        entityType: "CONSUMABLE_ITEM",
        entityId: params.id,
      },
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Consumable delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}