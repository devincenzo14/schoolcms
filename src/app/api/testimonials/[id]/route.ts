import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
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
    if (!checkPermission(user.role, "testimonials", "update")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const testimonial = await Testimonial.findByIdAndUpdate(id, body, { new: true });
    if (!testimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: testimonial });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
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
    if (!checkPermission(user.role, "testimonials", "delete")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: testimonial });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
