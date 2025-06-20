import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value || request.headers.get("authorization") || null;
  const role = request.cookies.get("authRole")?.value;
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!token;

  // Jika mengakses root "/" langsung
  if (pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect berdasarkan role jika sudah login
    if (role === "Admin") {
      return NextResponse.redirect(new URL("/admin/articles", request.url));
    } else {
      return NextResponse.redirect(new URL("/user/content", request.url));
    }
  }

  // Cegah akses halaman login jika sudah login
  if (isLoggedIn && pathname === "/login") {
    if (role === "Admin") {
      return NextResponse.redirect(new URL("/admin/articles", request.url));
    } else {
      return NextResponse.redirect(new URL("/user/content", request.url));
    }
  }

  // Proteksi rute tertentu jika belum login
  const protectedPaths = ["/admin", "/admin/articles", "/user"];
  const accessingProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isLoggedIn && accessingProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/user/:path*"],
};
