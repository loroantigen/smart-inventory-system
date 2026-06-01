import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePropertyNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type, items } = body;

    if (!type || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Provide type and items array" },
        { status: 400 }
      );
    }

    const results = { created: 0, errors: [] as string[] };

    if (type === "inventory") {
      for (const item of items) {
        try {
          await prisma.inventoryItem.create({
            data: {
              propertyNumber: item.propertyNumber || generatePropertyNumber("INV"),
              itemName: item.itemName,
              description: item.description,
              category: item.category || "OTHER",
              brand: item.brand,
              model: item.model,
              serialNumber: item.serialNumber,
              departmentId: item.departmentId,
              fundCode: item.fundCode,
              fundSource: item.fundSource,
              supplier: item.supplier,
              purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
              purchaseCost: item.purchaseCost ? parseFloat(item.purchaseCost) : null,
              warrantyExpiration: item.warrantyExpiration ? new Date(item.warrantyExpiration) : null,
              status: item.status || "AVAILABLE",
            },
          });
          results.created++;
        } catch (e: any) {
          results.errors.push(`Failed to create ${item.itemName}: ${e.message}`);
        }
      }
    } else if (type === "consumables") {
      for (const item of items) {
        try {
          const created = await prisma.consumableItem.create({
            data: {
              propertyNumber: item.propertyNumber || generatePropertyNumber("CON"),
              itemName: item.itemName,
              category: item.category || "Other",
              description: item.description,
              quantity: parseInt(item.quantity) || 0,
              unitType: item.unitType,
              batchNumber: item.batchNumber,
              expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
              reorderLevel: parseInt(item.reorderLevel) || 10,
              criticalLevel: parseInt(item.criticalLevel) || 5,
              departmentId: item.departmentId,
              fundCode: item.fundCode,
              fundSource: item.fundSource,
              supplier: item.supplier,
              dateReceived: item.dateReceived ? new Date(item.dateReceived) : null,
            },
          });

          if (created.quantity > 0) {
            await prisma.stockMovement.create({
              data: {
                consumableItemId: created.id,
                type: "STOCK_IN",
                quantity: created.quantity,
                previousQuantity: 0,
                newQuantity: created.quantity,
                reason: "Bulk import",
                performedBy: session.user.id,
              },
            });
          }
          results.created++;
        } catch (e: any) {
          results.errors.push(`Failed to create ${item.itemName}: ${e.message}`);
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'inventory' or 'consumables'" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BULK_IMPORT",
        entityType: type.toUpperCase(),
        entityId: "bulk",
        newValues: { count: results.created, errors: results.errors.length },
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}