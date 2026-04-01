import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Class from "@/models/Class";
import { getAuthUser } from "@/lib/auth";
import { classSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "classes", "read")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();

    let filter = {};
    if (user.role === "teacher") {
      filter = { teacherId: user.userId };
    } else if (user.role === "student") {
      filter = { students: user.userId };
    }

    const classes = await Class.find(filter)
      .populate("teacherId", "name")
      .populate("students", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: classes });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch classes" },
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
    if (!checkPermission(user.role, "classes", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = classSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const classDoc = await Class.create(parsed.data);
    const populated = await Class.findById(classDoc._id)
      .populate("teacherId", "name")
      .populate("students", "name email");

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create class" },
      { status: 500 }
    );
  }
}
