import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Carousel from "@/models/Carousel";
import { getAuthUser } from "@/lib/auth";
import { carouselSchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET() {
  try {
    await dbConnect();
    const slides = await Carousel.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json({ success: true, data: slides });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch carousel" },
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
    if (!checkPermission(user.role, "carousel", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = carouselSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const count = await Carousel.countDocuments();
    const slide = await Carousel.create({ ...parsed.data, order: parsed.data.order || count });
    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create slide" },
      { status: 500 }
    );
  }
}
