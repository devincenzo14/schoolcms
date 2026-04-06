import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import StudentApplication from "@/models/StudentApplication";
import { getAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const profile = await User.findById(user.userId).select("-password");
    if (!profile) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // For students: auto-fill empty fields from their approved application
    if (profile.role === "student" && !profile.firstName && profile.email) {
      const application = await StudentApplication.findOne({
        email: profile.email.toLowerCase(),
        status: "approved",
      }).sort({ createdAt: -1 });

      if (application) {
        const fields = ["firstName", "lastName", "middleName", "suffix", "gender", "address",
          "gradeLevel", "parentGuardianName", "parentGuardianRelationship", "contactNumber", "previousSchool"] as const;
        for (const field of fields) {
          if (!profile[field] && application[field]) {
            (profile as unknown as Record<string, unknown>)[field] = application[field];
          }
        }
        if (!profile.age && application.age) profile.age = application.age;
        if (!profile.dateOfBirth && application.dateOfBirth) profile.dateOfBirth = application.dateOfBirth;
        await profile.save();
      }
    }

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, email, currentPassword, newPassword,
      firstName, lastName, middleName, suffix, age, dateOfBirth,
      gender, address, gradeLevel, parentGuardianName,
      parentGuardianRelationship, contactNumber, previousSchool
    } = body;

    const existingUser = await User.findById(user.userId);
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Update name if provided
    if (name && name.trim()) {
      existingUser.name = name.trim();
    }

    // Update email if provided
    if (email && email.trim() && email !== existingUser.email) {
      const emailTaken = await User.findOne({ email: email.trim(), _id: { $ne: user.userId } });
      if (emailTaken) {
        return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
      }
      existingUser.email = email.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: "Current password is required" }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "New password must be at least 6 characters" }, { status: 400 });
      }
      existingUser.password = await bcrypt.hash(newPassword, 10);
    }

    // Update student personal info fields
    const stringFields = ["firstName", "lastName", "middleName", "suffix", "gender", "address",
      "gradeLevel", "parentGuardianName", "parentGuardianRelationship", "contactNumber", "previousSchool"] as const;
    for (const field of stringFields) {
      if (body[field] !== undefined) {
        (existingUser as unknown as Record<string, unknown>)[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
      }
    }
    if (age !== undefined) {
      existingUser.age = age ? Number(age) : undefined;
    }
    if (dateOfBirth !== undefined) {
      existingUser.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    }

    await existingUser.save();

    const updated = await User.findById(user.userId).select("-password");
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
