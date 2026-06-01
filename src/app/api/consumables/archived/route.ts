export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.consumableItem.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: {
        department: { select: { name: true } },
      },
    });

    const formattedItems = items.map((item) => ({
      ...item,
      departmentName: item.department?.name || null,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Archived consumables fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived items" },
      { status: 500 }
    );
  }
}