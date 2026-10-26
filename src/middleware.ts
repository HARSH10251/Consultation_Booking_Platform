import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;

    // Doctor dashboard protection
    if (pathname.startsWith("/doctor") && role !== "doctor" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin dashboard protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public pages
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/doctors") ||
          pathname.startsWith("/api/health") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/cron")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/waitlist/:path*",
    "/doctor/:path*",
    "/admin/:path*",
  ],
};
