import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/zod-schemas";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: { select: { name: true } },
          _count: {
            select: { assignedItems: true, createdRequests: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      ...user,
      departmentName: user.department?.name || null,
      assignedItemsCount: user._count.assignedItems,
      requestsCount: user._count.createdRequests,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    const validated = userSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const tempPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        ...validated,
        password: hashedPassword,
        status: validated.status || "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "USER_CREATED",
        entityType: "USER",
        entityId: user.id,
        newValues: { name: user.name, email: user.email, role: user.role },
      },
    });

    return NextResponse.json(
      { user, tempPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "USER_UPDATED",
        entityType: "USER",
        entityId: id,
        oldValues: oldUser,
        newValues: user,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}