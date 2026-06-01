import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN can restore — not moderator
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (!item.deletedAt) {
      return NextResponse.json({ error: "Item is not archived" }, { status: 400 });
    }

    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { deletedAt: null },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "INVENTORY_RESTORED",
        entityType: "INVENTORY_ITEM",
        entityId: params.id,
        newValues: item,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory restore error:", error);
    return NextResponse.json({ error: "Failed to restore item" }, { status: 500 });
  }
}