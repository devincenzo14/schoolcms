import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Program from "@/models/Program";
import { getAuthUser } from "@/lib/auth";
import { programSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET() {
  try {
    await dbConnect();
    const programs = await Program.find().sort({ order: 1 });
    return NextResponse.json({ success: true, data: programs });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch programs" },
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
    if (!checkPermission(user.role, "programs", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = programSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const count = await Program.countDocuments();
    const program = await Program.create({ ...parsed.data, order: parsed.data.order || count });
    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create program" },
      { status: 500 }
    );
  }
}
