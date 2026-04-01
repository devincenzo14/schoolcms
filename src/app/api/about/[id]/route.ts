import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AboutMember from "@/models/AboutMember";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!checkPermission(user.role, "about", "update")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const member = await AboutMember.findByIdAndUpdate(id, body, { new: true });
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!checkPermission(user.role, "about", "delete")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const member = await AboutMember.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { message: "Member deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete member" }, { status: 500 });
  }
}
