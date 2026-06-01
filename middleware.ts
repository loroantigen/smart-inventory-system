import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public paths
    if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Role-based access control
    const userRole = token?.role as string;

    // Admin only routes
    if (path.startsWith("/users") || path.startsWith("/audit-logs") || path.startsWith("/settings")) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Moderator+ routes
    if (path.startsWith("/reports") && userRole === "USER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")) {
          return true;
        }
        return token !== null;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};