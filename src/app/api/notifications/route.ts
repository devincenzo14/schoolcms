import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grade from "@/models/Grade";
import StudentApplication from "@/models/StudentApplication";
import Announcement from "@/models/Announcement";
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

    await dbConnect();

    const counts: Record<string, number> = {};

    if (user.role === "admin" || user.role === "principal") {
      const [pendingGrades, pendingApplications, draftAnnouncements] =
        await Promise.all([
          Grade.countDocuments({ status: "pending" }),
          StudentApplication.countDocuments({ status: "pending" }),
          Announcement.countDocuments({ isPublished: false }),
        ]);

      counts.grades = pendingGrades;
      counts.applications = pendingApplications;
      counts.announcements = draftAnnouncements;
    } else if (user.role === "teacher") {
      const [rejectedGrades, draftAnnouncements] = await Promise.all([
        Grade.countDocuments({ teacherId: user.userId, status: "rejected" }),
        Announcement.countDocuments({ isPublished: false }),
      ]);

      counts.grades = rejectedGrades;
      counts.announcements = draftAnnouncements;
    }

    return NextResponse.json({ success: true, data: counts });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
