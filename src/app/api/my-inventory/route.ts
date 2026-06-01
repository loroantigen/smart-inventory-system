// src/app/api/my-inventory/route.ts
//
// GET  — list all consumable items in the current user's inventory.
//         Admins/Moderators can pass ?userId=<id> to view any user's inventory.
// No POST — inventory is populated automatically when a request is approved.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Admins/Moderators may supply ?userId=... to inspect another user's stock
    let targetUserId = session.user.id;
    if (
      ["ADMIN", "MODERATOR"].includes(session.user.role) &&
      searchParams.get("userId")
    ) {
      targetUserId = searchParams.get("userId")!;
    }

    const where: any = { userId: targetUserId };

    if (search) {
      where.consumableItem = {
        itemName: { contains: search, mode: "insensitive" },
      };
    }

    const [entries, total] = await Promise.all([
      prisma.userConsumableInventory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
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
          // Include only the 3 most recent distributions for the list view
          distributions: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.userConsumableInventory.count({ where }),
    ]);

    const formatted = entries.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      consumableItemId: entry.consumableItemId,
      quantity: entry.quantity,
      updatedAt: entry.updatedAt,
      createdAt: entry.createdAt,
      itemName: entry.consumableItem.itemName,
      category: entry.consumableItem.category,
      unitType: entry.consumableItem.unitType,
      expirationDate: entry.consumableItem.expirationDate,
      description: entry.consumableItem.description,
      departmentName: entry.consumableItem.department?.name || null,
      recentDistributions: entry.distributions,
    }));

    return NextResponse.json({
      items: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("My-inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your inventory" },
      { status: 500 }
    );
  }
}