import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value || request.headers.get("authorization") || null;
  const role = request.cookies.get("authRole")?.value;

  const { pathname } = request.nextUrl;

  const isLoggedIn = !!token;

  // Cegah akses halaman login jika sudah login
  if (isLoggedIn && pathname === "/login") {
    if (role === "Admin") {
      return NextResponse.redirect(new URL("/admin/articles", request.url));
    } else {
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  // Jika belum login dan akses halaman protected
  const protectedPaths = ["/admin", "/admin/articles", "/user"];
  const accessingProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isLoggedIn && accessingProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/user/:path*"],
};
