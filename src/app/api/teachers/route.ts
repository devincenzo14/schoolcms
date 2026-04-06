import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Class from "@/models/Class";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!["admin", "principal"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();

    const teachers = await User.find({ role: "teacher" })
      .select("name email createdAt")
      .sort({ name: 1 })
      .lean();

    const classes = await Class.find({})
      .select("teacherId subject students")
      .lean();

    const teacherData = teachers.map((teacher) => {
      const teacherClasses = classes.filter(
        (c) => c.teacherId.toString() === teacher._id.toString()
      );
      const subjects = teacherClasses.map((c) => c.subject);
      const uniqueStudentIds = new Set(
        teacherClasses.flatMap((c) => c.students.map((s) => s.toString()))
      );

      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt,
        subjects,
        subjectCount: subjects.length,
        studentCount: uniqueStudentIds.size,
      };
    });

    return NextResponse.json({ success: true, data: teacherData });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
