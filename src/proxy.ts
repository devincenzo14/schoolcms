import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/student")) {
    const user = getAuthUserFromRequest(request);

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect students away from dashboard
    if (pathname.startsWith("/dashboard") && user.role === "student") {
      return NextResponse.redirect(new URL("/student", request.url));
    }

    // Redirect non-students away from student portal
    if (pathname.startsWith("/student") && user.role !== "student") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*"],
};
