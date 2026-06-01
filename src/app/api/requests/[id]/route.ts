// src/app/api/requests/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await prisma.consumableRequest.findUnique({
      where: { id: params.id },
      include: {
        consumableItem: {
          select: {
            itemName: true,
            unitType: true,
            quantity: true,
            category: true,
            description: true,
          },
        },
        requester: {
          select: {
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
        approver: { select: { name: true } },
        attachments: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Regular users can only view their own requests
    if (
      session.user.role === "USER" &&
      request.requesterId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...request,
      consumableItemName: request.consumableItem.itemName,
      unitType: request.consumableItem.unitType,
      availableQuantity: request.consumableItem.quantity,
      requesterName: request.requester.name,
      requesterEmail: request.requester.email,
      requesterDepartment: request.requester.department?.name || null,
      approverName: request.approver?.name || null,
    });
  } catch (error) {
    console.error("Request detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}