import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AboutMember from "@/models/AboutMember";
import { getAuthUser } from "@/lib/auth";
import { aboutMemberSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET() {
  try {
    await dbConnect();
    const members = await AboutMember.find().sort({ type: 1, order: 1 });
    return NextResponse.json({ success: true, data: members });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!checkPermission(user.role, "about", "create")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const parsed = aboutMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const member = await AboutMember.create(parsed.data);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create member" }, { status: 500 });
  }
}
