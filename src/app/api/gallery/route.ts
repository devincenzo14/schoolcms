import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import { getAuthUser } from "@/lib/auth";
import { gallerySchema } from "@/lib/validators";
import { checkPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const category = req.nextUrl.searchParams.get("category");
    const filter: Record<string, string> = {};
    if (category && ["Nursery", "Kinder", "Preschool"].includes(category)) {
      filter.category = category;
    }
    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: images });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
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
    if (!checkPermission(user.role, "gallery", "create")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const image = await Gallery.create(parsed.data);
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to add image" },
      { status: 500 }
    );
  }
}
