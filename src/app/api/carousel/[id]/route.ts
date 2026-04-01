import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Carousel from "@/models/Carousel";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "carousel", "update")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const slide = await Carousel.findByIdAndUpdate(id, body, { new: true });

    if (!slide) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: slide });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update slide" },
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
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "carousel", "delete")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const slide = await Carousel.findByIdAndDelete(id);

    if (!slide) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { message: "Slide deleted" } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete slide" },
      { status: 500 }
    );
  }
}
