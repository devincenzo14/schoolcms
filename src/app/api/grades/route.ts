import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grade from "@/models/Grade";
import { getAuthUser } from "@/lib/auth";
import { gradeSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "grades", "read")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const teacherId = searchParams.get("teacherId");

    const filter: Record<string, string> = {};

    if (user.role === "student") {
      filter.studentId = user.userId;
    } else if (user.role === "teacher") {
      filter.teacherId = user.userId;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (teacherId && user.role !== "teacher") {
      filter.teacherId = teacherId;
    }

    const grades = await Grade.find(filter)
      .populate("studentId", "name email")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: grades });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch grades" },
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
    if (!checkPermission(user.role, "grades", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = gradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const grade = await Grade.create({
      ...parsed.data,
      teacherId: user.userId,
    });

    const populated = await Grade.findById(grade._id)
      .populate("studentId", "name email")
      .populate("teacherId", "name");

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create grade" },
      { status: 500 }
    );
  }
}
