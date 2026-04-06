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

    // Handle approval action from admin/principal
    if (body.action === "approve" || body.action === "reject") {
      if (user.role !== "admin" && user.role !== "principal") {
        return NextResponse.json(
          { success: false, error: "Only admin or principal can approve/reject" },
          { status: 403 }
        );
      }

      const grade = await Grade.findById(id);
      if (!grade) {
        return NextResponse.json(
          { success: false, error: "Grade not found" },
          { status: 404 }
        );
      }

      if (body.action === "approve") {
        grade.status = "approved";
        grade.approvedBy = user.userId as unknown as import("mongoose").Types.ObjectId;
      } else {
        // Reject: revert to previous score
        if (grade.previousScore !== null) {
          grade.score = grade.previousScore;
        }
        grade.status = "rejected";
        grade.previousScore = null;
      }

      await grade.save();

      const populated = await Grade.findById(id)
        .populate("studentId", "name email")
        .populate("teacherId", "name")
        .populate("approvedBy", "name");

      return NextResponse.json({ success: true, data: populated });
    }

    // Regular grade update
    const filter: Record<string, string> = { _id: id };
    if (user.role === "teacher") {
      filter.teacherId = user.userId;
    }

    const existingGrade = await Grade.findOne(filter);
    if (!existingGrade) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      );
    }

    // If teacher is updating score, require approval
    if (user.role === "teacher" && body.score !== undefined && body.score !== existingGrade.score) {
      existingGrade.previousScore = existingGrade.score;
      existingGrade.score = body.score;
      existingGrade.status = "pending";
      existingGrade.requestedAt = new Date();
      existingGrade.approvedBy = null;
      if (body.subject) existingGrade.subject = body.subject;
      if (body.term) existingGrade.term = body.term;
      if (body.remarks !== undefined) existingGrade.remarks = body.remarks;
      await existingGrade.save();
    } else {
      // Admin/principal can update directly, or teacher updating non-score fields
      Object.assign(existingGrade, body);
      if (user.role === "admin" || user.role === "principal") {
        existingGrade.status = "approved";
      }
      await existingGrade.save();
    }

    const populated = await Grade.findById(id)
      .populate("studentId", "name email")
      .populate("teacherId", "name")
      .populate("approvedBy", "name");

    return NextResponse.json({ success: true, data: populated });
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
