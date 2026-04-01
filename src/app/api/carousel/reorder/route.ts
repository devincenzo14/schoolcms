import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Carousel from "@/models/Carousel";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { reorderSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!checkPermission(user.role, "carousel", "update")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const bulkOps = parsed.data.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Carousel.bulkWrite(bulkOps);

    return NextResponse.json({ success: true, data: { message: "Reordered" } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to reorder" },
      { status: 500 }
    );
  }
}
