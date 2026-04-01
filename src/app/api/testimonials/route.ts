import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { testimonialSchema } from "@/lib/validators";

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: testimonials });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!checkPermission(user.role, "testimonials", "create")) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const parsed = testimonialSchema.parse(body);
    const testimonial = await Testimonial.create(parsed);
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
