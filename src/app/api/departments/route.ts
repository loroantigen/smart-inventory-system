import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { departmentSchema } from "@/lib/zod-schemas";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true, inventoryItems: true, consumableItems: true },
        },
      },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Departments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = departmentSchema.parse(body);

    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { name: { equals: validated.name, mode: "insensitive" } },
          { code: { equals: validated.code, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Department with this name or code already exists" },
        { status: 400 }
      );
    }

    const dept = await prisma.department.create({ data: validated });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DEPARTMENT_CREATED",
        entityType: "DEPARTMENT",
        entityId: dept.id,
        newValues: dept,
      },
    });

    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    console.error("Department create error:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}