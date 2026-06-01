import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateBatchNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BATCH-${y}${m}${d}-${rand}`;
}

/** Returns the soonest non-null expiration date across all ACTIVE batches. */
async function getNearestExpiry(consumableItemId: string): Promise<Date | null> {
  const result = await prisma.consumableBatch.findFirst({
    where: {
      consumableItemId,
      status: "ACTIVE",
      expirationDate: { not: null },
    },
    orderBy: { expirationDate: "asc" },
    select: { expirationDate: true },
  });
  return result?.expirationDate ?? null;
}

// ─── GET /api/stock-movements ─────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const consumableItemId = searchParams.get("consumableItemId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const where = consumableItemId ? { consumableItemId } : {};

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          consumableItem: { select: { itemName: true, unitType: true } },
          user: { select: { name: true } },
          consumableBatch: { select: { batchNumber: true, expirationDate: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return NextResponse.json({
      movements,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Stock movements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

// ─── POST /api/stock-movements ────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      consumableItemId,
      type,
      quantity,
      reason,
      // STOCK_IN only
      batchNumber,
      expirationDate,
    } = body;

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!consumableItemId || !type || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "consumableItemId, type, and a positive quantity are required" },
        { status: 400 }
      );
    }

    if (!["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"].includes(type)) {
      return NextResponse.json({ error: "Invalid movement type" }, { status: 400 });
    }

    const item = await prisma.consumableItem.findUnique({
      where: { id: consumableItemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // ── STOCK IN ──────────────────────────────────────────────────────────────
    if (type === "STOCK_IN") {
      const newBatchNumber = batchNumber?.trim() || generateBatchNumber();

      // Every delivery creates a new batch (new lot)
      const batch = await prisma.consumableBatch.create({
        data: {
          consumableItemId,
          batchNumber: newBatchNumber,
          quantity,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          status: "ACTIVE",
        },
      });

      const previousQuantity = item.quantity;
      const newQuantity = previousQuantity + quantity;
      const nearestExpiry = await getNearestExpiry(consumableItemId);

      await prisma.consumableItem.update({
        where: { id: consumableItemId },
        data: { quantity: newQuantity, expirationDate: nearestExpiry },
      });

      const movement = await prisma.stockMovement.create({
        data: {
          consumableItemId,
          consumableBatchId: batch.id,
          type: "STOCK_IN",
          quantity,
          previousQuantity,
          newQuantity,
          reason: reason || "Stock In",
          performedBy: session.user.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "STOCK_IN",
          entityType: "CONSUMABLE_ITEM",
          entityId: consumableItemId,
          oldValues: { quantity: previousQuantity },
          newValues: { quantity: newQuantity, batchNumber: batch.batchNumber },
        },
      });

      return NextResponse.json({ movement, batch }, { status: 201 });
    }

    // ── STOCK OUT (FEFO) ──────────────────────────────────────────────────────
    if (type === "STOCK_OUT") {
      if (item.quantity < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`,
          },
          { status: 400 }
        );
      }

      // Fetch all active batches with stock remaining
      const activeBatches = await prisma.consumableBatch.findMany({
        where: {
          consumableItemId,
          status: "ACTIVE",
          quantity: { gt: 0 },
        },
        orderBy: { expirationDate: "asc" }, // Prisma puts nulls last on asc
      });

      // Guarantee FEFO sort: dated batches (oldest first), then undated
      const sortedBatches = [
        ...activeBatches
          .filter((b) => b.expirationDate !== null)
          .sort(
            (a, b) =>
              new Date(a.expirationDate!).getTime() -
              new Date(b.expirationDate!).getTime()
          ),
        ...activeBatches.filter((b) => b.expirationDate === null),
      ];

      const previousQuantity = item.quantity;
      let remaining = quantity;
      const createdMovements = [];

      for (const batch of sortedBatches) {
        if (remaining <= 0) break;

        const deduct = Math.min(batch.quantity, remaining);
        const newBatchQty = batch.quantity - deduct;

        await prisma.consumableBatch.update({
          where: { id: batch.id },
          data: {
            quantity: newBatchQty,
            status: newBatchQty === 0 ? "DEPLETED" : "ACTIVE",
          },
        });

        const mov = await prisma.stockMovement.create({
          data: {
            consumableItemId,
            consumableBatchId: batch.id,
            type: "STOCK_OUT",
            quantity: deduct,
            previousQuantity,
            newQuantity: previousQuantity - (quantity - remaining + deduct),
            reason: reason || "Stock Out",
            performedBy: session.user.id,
          },
        });

        createdMovements.push(mov);
        remaining -= deduct;
      }

      const newQuantity = previousQuantity - quantity;
      const nearestExpiry = await getNearestExpiry(consumableItemId);

      await prisma.consumableItem.update({
        where: { id: consumableItemId },
        data: { quantity: newQuantity, expirationDate: nearestExpiry },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "STOCK_OUT",
          entityType: "CONSUMABLE_ITEM",
          entityId: consumableItemId,
          oldValues: { quantity: previousQuantity },
          newValues: { quantity: newQuantity },
        },
      });

      return NextResponse.json({ movements: createdMovements }, { status: 201 });
    }

    // ── ADJUSTMENT ────────────────────────────────────────────────────────────
    // Sets the item quantity to an absolute value (no batch changes).
    // Use for manual corrections / physical inventory counts.
    if (type === "ADJUSTMENT") {
      const previousQuantity = item.quantity;
      const newQuantity = quantity; // quantity is the target total, not a delta

      await prisma.consumableItem.update({
        where: { id: consumableItemId },
        data: { quantity: newQuantity },
      });

      const movement = await prisma.stockMovement.create({
        data: {
          consumableItemId,
          type: "ADJUSTMENT",
          quantity,
          previousQuantity,
          newQuantity,
          reason: reason || "Manual Adjustment",
          performedBy: session.user.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "STOCK_ADJUSTMENT",
          entityType: "CONSUMABLE_ITEM",
          entityId: consumableItemId,
          oldValues: { quantity: previousQuantity },
          newValues: { quantity: newQuantity },
        },
      });

      return NextResponse.json({ movement }, { status: 201 });
    }

    // Should never reach here given the validation above
    return NextResponse.json({ error: "Invalid movement type" }, { status: 400 });
  } catch (error: any) {
  console.error("Stock movement error:", error);
  return NextResponse.json(
    {
      error: "Failed to record stock movement",
      detail: process.env.NODE_ENV === "development" ? error?.message : undefined,
    },
    { status: 500 }
  );
}
}