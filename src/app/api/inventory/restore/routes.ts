// src/app/api/inventory/[id]/restore/route.ts
export const dynamic = "force-dynamic";

// src/app/api/inventory/[id]/restore/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN can restore archived items
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
      return NextResponse.json(
        { error: "Item is not archived" },
        { status: 400 }
      );
    }

    const restored = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { deletedAt: null },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "INVENTORY_RESTORED",
        entityType: "INVENTORY_ITEM",
        entityId: params.id,
        oldValues: { deletedAt: item.deletedAt },
        newValues: { deletedAt: null },
      },
    });

    return NextResponse.json(restored);
  } catch (error) {
    console.error("Inventory restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore item" },
      { status: 500 }
    );
  }
}