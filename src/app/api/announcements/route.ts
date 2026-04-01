import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";
import { getAuthUser } from "@/lib/auth";
import { announcementSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const now = new Date();
    const category = req.nextUrl.searchParams.get("category");

    // Auto-delete expired announcements (older than 30 days)
    await Announcement.deleteMany({ expiresAt: { $lte: now } });

    const filter: Record<string, unknown> = {
      isPublished: true,
      $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
    };
    if (category && ["Nursery", "Kinder", "Preschool"].includes(category)) {
      filter.category = { $in: [category, "All"] };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: announcements });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "announcements", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };

    // Set expiresAt to 30 days from now (or from scheduledAt)
    const baseDate = data.scheduledAt ? new Date(data.scheduledAt as string) : new Date();
    data.expiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const announcement = await Announcement.create(data);
    return NextResponse.json(
      { success: true, data: announcement },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
