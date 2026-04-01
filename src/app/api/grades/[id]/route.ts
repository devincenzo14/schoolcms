import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grade from "@/models/Grade";
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
    if (!checkPermission(user.role, "grades", "update")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const filter: Record<string, string> = { _id: id };
    if (user.role === "teacher") {
      filter.teacherId = user.userId;
    }

    const grade = await Grade.findOneAndUpdate(filter, body, { new: true })
      .populate("studentId", "name email")
      .populate("teacherId", "name");

    if (!grade) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: grade });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update grade" },
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
    if (!checkPermission(user.role, "grades", "delete")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const filter: Record<string, string> = { _id: id };
    if (user.role === "teacher") {
      filter.teacherId = user.userId;
    }

    const grade = await Grade.findOneAndDelete(filter);

    if (!grade) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Grade deleted" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}
