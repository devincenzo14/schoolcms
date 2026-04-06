import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { getAuthUser } from "@/lib/auth";

const ALLOWED_KEYS = ["mission", "vision", "coreValues"];

export async function GET() {
  try {
    await dbConnect();
    const settings = await SiteSettings.find({ key: { $in: ALLOWED_KEYS } }).lean();
    const data: Record<string, string> = {};
    for (const s of settings) {
      data[s.key] = s.value;
    }
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!["admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    for (const key of ALLOWED_KEYS) {
      if (typeof body[key] === "string") {
        await SiteSettings.findOneAndUpdate(
          { key },
          { value: body[key] },
          { upsert: true, new: true }
        );
      }
    }

    const settings = await SiteSettings.find({ key: { $in: ALLOWED_KEYS } }).lean();
    const data: Record<string, string> = {};
    for (const s of settings) {
      data[s.key] = s.value;
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
