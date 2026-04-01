import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import StudentApplication from "@/models/StudentApplication";
import { getAuthUser } from "@/lib/auth";
import { applicationSchema } from "@/lib/validators";
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
    if (!checkPermission(user.role, "applications", "read")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const applications = await StudentApplication.find().sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, data: applications });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const application = await StudentApplication.create(parsed.data);
    return NextResponse.json(
      { success: true, data: application },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
