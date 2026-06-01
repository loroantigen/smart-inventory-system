import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumableRequestSchema, requestApprovalSchema } from "@/lib/zod-schemas";
import { generateRequestNumber } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};

    // Regular users only see their own requests
    if (session.user.role === "USER") {
      where.requesterId = session.user.id;
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.consumableRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          consumableItem: { select: { itemName: true, unitType: true } },
          requester: {
            select: {
              name: true,
              email: true,
              department: { select: { name: true } },
            },
          },
          approver: { select: { name: true } },
          _count: { select: { attachments: true } },
        },
      }),
      prisma.consumableRequest.count({ where }),
    ]);

    const formattedRequests = requests.map((req) => ({
      ...req,
      consumableItemName: req.consumableItem.itemName,
      unitType: req.consumableItem.unitType,
      requesterName: req.requester.name,
      requesterEmail: req.requester.email,
      requesterDepartment: req.requester.department?.name || null,
      approverName: req.approver?.name || null,
      attachmentCount: req._count.attachments,
    }));

    return NextResponse.json({
      requests: formattedRequests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Requests fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = consumableRequestSchema.parse(body);

    const consumableItem = await prisma.consumableItem.findUnique({
      where: { id: validated.consumableItemId },
    });

    if (!consumableItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (consumableItem.quantity < validated.quantity) {
      return NextResponse.json(
        { error: "Requested quantity exceeds available stock" },
        { status: 400 }
      );
    }

    const requestNumber = generateRequestNumber();

    const request = await prisma.consumableRequest.create({
      data: {
        ...validated,
        requestNumber,
        requesterId: session.user.id,
        status: "PENDING",
      },
    });

    // Notify moderators
    const moderators = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MODERATOR"] }, status: "ACTIVE" },
    });

    await Promise.all(
      moderators.map((mod) =>
        prisma.notification.create({
          data: {
            userId: mod.id,
            type: "SYSTEM",
            title: "New Consumable Request",
            message: `Request ${requestNumber} requires your approval`,
            referenceId: request.id,
          },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REQUEST_CREATED",
        entityType: "CONSUMABLE_REQUEST",
        entityId: request.id,
        newValues: request,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Request create error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = requestApprovalSchema.parse(body);

    const existingRequest = await prisma.consumableRequest.findUnique({
      where: { id: validated.requestId },
      include: { consumableItem: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    const newStatus = validated.action === "approve" ? "APPROVED" : "REJECTED";

    const updatedRequest = await prisma.consumableRequest.update({
      where: { id: validated.requestId },
      data: {
        status: newStatus,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        rejectionReason:
          validated.action === "reject" ? validated.rejectionReason : null,
      },
    });

    if (validated.action === "approve") {
      const newMainQuantity =
        existingRequest.consumableItem.quantity - existingRequest.quantity;

      // ✅ 1. Deduct from main (admin) inventory
      await prisma.consumableItem.update({
        where: { id: existingRequest.consumableItemId },
        data: { quantity: newMainQuantity },
      });

      // ✅ 2. Add to user's personal inventory (upsert — create or increment)
      await prisma.userConsumableInventory.upsert({
        where: {
          userId_consumableItemId: {
            userId: existingRequest.requesterId,
            consumableItemId: existingRequest.consumableItemId,
          },
        },
        update: {
          quantity: { increment: existingRequest.quantity },
        },
        create: {
          userId: existingRequest.requesterId,
          consumableItemId: existingRequest.consumableItemId,
          quantity: existingRequest.quantity,
        },
      });

      // ✅ 3. Record stock movement on main inventory
      await prisma.stockMovement.create({
        data: {
          consumableItemId: existingRequest.consumableItemId,
          type: "STOCK_OUT",
          quantity: existingRequest.quantity,
          previousQuantity: existingRequest.consumableItem.quantity,
          newQuantity: newMainQuantity,
          reason: `Approved request ${existingRequest.requestNumber} — issued to user`,
          referenceNumber: existingRequest.requestNumber,
          performedBy: session.user.id,
        },
      });

      // ✅ 4. Low stock alert if needed
      if (newMainQuantity <= existingRequest.consumableItem.reorderLevel) {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", status: "ACTIVE" },
        });

        await Promise.all(
          admins.map((admin) =>
            prisma.notification.create({
              data: {
                userId: admin.id,
                type: "LOW_STOCK",
                title: "Low Stock Alert",
                message: `${existingRequest.consumableItem.itemName} is running low (${newMainQuantity} remaining)`,
                referenceId: existingRequest.consumableItemId,
              },
            })
          )
        );
      }
    }

    // Notify requester of outcome
    await prisma.notification.create({
      data: {
        userId: existingRequest.requesterId,
        type: validated.action === "approve" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
        title: validated.action === "approve" ? "Request Approved" : "Request Rejected",
        message: `Your request ${existingRequest.requestNumber} has been ${validated.action}d`,
        referenceId: existingRequest.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `REQUEST_${validated.action.toUpperCase()}ED`,
        entityType: "CONSUMABLE_REQUEST",
        entityId: existingRequest.id,
        oldValues: existingRequest,
        newValues: updatedRequest,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Request approval error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}