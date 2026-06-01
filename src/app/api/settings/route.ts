import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // In a real app, these would come from a database
    const settings = {
      appName: "Smart Inventory & Logistics System",
      lowStockThreshold: 10,
      expiryAlertDays: 30,
      enableEmailNotifications: false,
      enableAutoApproval: false,
      requireAttachments: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enable2FA: false,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    // In a real app, save to database
    // await prisma.settings.update({ ... });

    return NextResponse.json({ message: "Settings updated", settings: body });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}