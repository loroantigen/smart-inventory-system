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

    const [inventory, consumables, users, departments, requests, auditLogs] = await Promise.all([
      prisma.inventoryItem.findMany({ where: { deletedAt: null } }),
      prisma.consumableItem.findMany({ where: { deletedAt: null } }),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true, departmentId: true, createdAt: true } }),
      prisma.department.findMany(),
      prisma.consumableRequest.findMany(),
      prisma.auditLog.findMany({ take: 1000, orderBy: { createdAt: "desc" } }),
    ]);

    const backup = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
      data: {
        departments,
        users,
        inventory,
        consumables,
        requests,
        auditLogs,
      },
    };

    return NextResponse.json(backup);
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
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
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: "No backup data provided" }, { status: 400 });
    }

    // Note: In production, you'd want to validate the backup format
    // and handle conflicts/duplicates carefully
    const results = {
      departments: 0,
      users: 0,
      inventory: 0,
      consumables: 0,
      errors: [] as string[],
    };

    // Restore departments
    if (data.departments) {
      for (const dept of data.departments) {
        try {
          await prisma.department.upsert({
            where: { id: dept.id },
            update: dept,
            create: dept,
          });
          results.departments++;
        } catch (e: any) {
          results.errors.push(`Department ${dept.name}: ${e.message}`);
        }
      }
    }

    // Restore users
    if (data.users) {
      for (const user of data.users) {
        try {
          await prisma.user.upsert({
            where: { id: user.id },
            update: user,
            create: { ...user, password: null },
          });
          results.users++;
        } catch (e: any) {
          results.errors.push(`User ${user.email}: ${e.message}`);
        }
      }
    }

    // Restore inventory
    if (data.inventory) {
      for (const item of data.inventory) {
        try {
          await prisma.inventoryItem.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
          results.inventory++;
        } catch (e: any) {
          results.errors.push(`Inventory ${item.itemName}: ${e.message}`);
        }
      }
    }

    // Restore consumables
    if (data.consumables) {
      for (const item of data.consumables) {
        try {
          await prisma.consumableItem.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
          results.consumables++;
        } catch (e: any) {
          results.errors.push(`Consumable ${item.itemName}: ${e.message}`);
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BACKUP_RESTORED",
        entityType: "SYSTEM",
        entityId: "backup",
        newValues: results,
      },
    });

    return NextResponse.json({
      message: "Backup restored successfully",
      results,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}