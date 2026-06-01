// src/app/api/inventory/archived/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        deletedAt: { not: null }, // only soft-deleted rows
      },
      orderBy: { deletedAt: "desc" },
      include: {
        department: { select: { name: true } },
        assignments: {
          where: { returnedAt: null },
          include: { user: { select: { name: true, email: true } } },
          take: 1,
        },
      },
    });

    const formatted = items.map((item) => ({
      ...item,
      departmentName: item.department?.name || null,
      assignedUserName: item.assignments[0]?.user?.name || null,
    }));

    return NextResponse.json({ items: formatted });
  } catch (error) {
    console.error("Archived inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived items" },
      { status: 500 }
    );
  }
}