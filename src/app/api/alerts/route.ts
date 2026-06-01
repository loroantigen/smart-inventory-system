import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Check for low stock items
    const lowStockItems = await prisma.consumableItem.findMany({
      where: {
        deletedAt: null,
        quantity: { lte: prisma.consumableItem.fields.reorderLevel }, // <-- FIXED
      },
      include: { department: { select: { name: true } } },
    });

    // Check for expired items
    const expiredItems = await prisma.consumableItem.findMany({
      where: {
        deletedAt: null,
        expirationDate: { lte: today },
      },
      include: { department: { select: { name: true } } },
    });

    // Check for near expiry items
    const nearExpiryItems = await prisma.consumableItem.findMany({
      where: {
        deletedAt: null,
        expirationDate: { gt: today, lte: thirtyDaysFromNow },
      },
      include: { department: { select: { name: true } } },
    });

    // Create notifications for admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", status: "ACTIVE" },
    });

    const notifications = [];

    for (const item of lowStockItems) {
      for (const admin of admins) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: admin.id,
            type: "LOW_STOCK",
            referenceId: item.id,
            createdAt: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
          },
        });
        if (!existing) {
          notifications.push(
            prisma.notification.create({
              data: {
                userId: admin.id,
                type: "LOW_STOCK",
                title: "Low Stock Alert",
                message: `${item.itemName} is running low (${item.quantity} ${item.unitType} remaining)`,
                referenceId: item.id,
              },
            })
          );
        }
      }
    }

    for (const item of expiredItems) {
      for (const admin of admins) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: admin.id,
            type: "EXPIRATION",
            referenceId: item.id,
            createdAt: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
          },
        });
        if (!existing) {
          notifications.push(
            prisma.notification.create({
              data: {
                userId: admin.id,
                type: "EXPIRATION",
                title: "Item Expired",
                message: `${item.itemName} has expired`,
                referenceId: item.id,
              },
            })
          );
        }
      }
    }

    for (const item of nearExpiryItems) {
      for (const admin of admins) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: admin.id,
            type: "EXPIRATION",
            referenceId: item.id,
            createdAt: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
          },
        });
        if (!existing) {
          const daysLeft = Math.ceil((item.expirationDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          notifications.push(
            prisma.notification.create({
              data: {
                userId: admin.id,
                type: "EXPIRATION",
                title: "Item Nearing Expiry",
                message: `${item.itemName} expires in ${daysLeft} days`,
                referenceId: item.id,
              },
            })
          );
        }
      }
    }

    await Promise.all(notifications);

    return NextResponse.json({
      alertsGenerated: notifications.length,
      lowStock: lowStockItems.length,
      expired: expiredItems.length,
      nearExpiry: nearExpiryItems.length,
    });
  } catch (error) {
    console.error("Alerts error:", error);
    return NextResponse.json(
      { error: "Failed to process alerts" },
      { status: 500 }
    );
  }
}