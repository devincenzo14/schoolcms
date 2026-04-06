import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import StudentApplication from "@/models/StudentApplication";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

export async function PATCH(
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
    if (!checkPermission(user.role, "applications", "update")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const { status } = body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const application = await StudentApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // When approved, auto-populate matching user's personal info from application
    if (status === "approved" && application.email) {
      const studentUser = await User.findOne({
        email: application.email.toLowerCase(),
        role: "student",
      });
      if (studentUser) {
        studentUser.firstName = application.firstName || studentUser.firstName;
        studentUser.lastName = application.lastName || studentUser.lastName;
        studentUser.middleName = application.middleName || studentUser.middleName;
        studentUser.suffix = application.suffix || studentUser.suffix;
        studentUser.age = application.age || studentUser.age;
        studentUser.dateOfBirth = application.dateOfBirth || studentUser.dateOfBirth;
        studentUser.gender = application.gender || studentUser.gender;
        studentUser.address = application.address || studentUser.address;
        studentUser.gradeLevel = application.gradeLevel || studentUser.gradeLevel;
        studentUser.parentGuardianName = application.parentGuardianName || studentUser.parentGuardianName;
        studentUser.parentGuardianRelationship = application.parentGuardianRelationship || studentUser.parentGuardianRelationship;
        studentUser.contactNumber = application.contactNumber || studentUser.contactNumber;
        studentUser.previousSchool = application.previousSchool || studentUser.previousSchool;
        await studentUser.save();
      }
    }

    return NextResponse.json({ success: true, data: application });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
