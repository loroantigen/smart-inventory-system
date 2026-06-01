import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchPattern = { contains: query, mode: "insensitive" as const }; // <-- FIXED

    const [inventory, consumables, users, requests] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: {
          deletedAt: null,
          OR: [
            { propertyNumber: searchPattern },
            { itemName: searchPattern },
            { serialNumber: searchPattern },
            { brand: searchPattern },
          ],
        },
        take: 5,
        select: {
          id: true,
          propertyNumber: true,
          itemName: true,
          category: true,
          status: true,
        },
      }),
      prisma.consumableItem.findMany({
        where: {
          deletedAt: null,
          OR: [
            { propertyNumber: searchPattern },
            { itemName: searchPattern },
            { batchNumber: searchPattern },
          ],
        },
        take: 5,
        select: {
          id: true,
          propertyNumber: true,
          itemName: true,
          category: true,
          quantity: true,
        },
      }),
      session.user.role === "ADMIN"
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: searchPattern },
                { email: searchPattern },
              ],
            },
            take: 5,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          })
        : Promise.resolve([]),
      prisma.consumableRequest.findMany({
        where: {
          OR: [
            { requestNumber: searchPattern },
            { purpose: searchPattern },
          ],
          ...(session.user.role === "USER" ? { requesterId: session.user.id } : {}),
        },
        take: 5,
        select: {
          id: true,
          requestNumber: true,
          status: true,
          priority: true,
        },
      }),
    ]);

    return NextResponse.json({
      results: {
        inventory: inventory.map((item) => ({ ...item, type: "inventory" })),
        consumables: consumables.map((item) => ({ ...item, type: "consumable" })),
        users: users.map((user) => ({ ...user, type: "user" })),
        requests: requests.map((req) => ({ ...req, type: "request" })),
      },
      total: inventory.length + consumables.length + users.length + requests.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}