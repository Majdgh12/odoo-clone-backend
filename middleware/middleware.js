import NextResponse from "next/server";
import jwt from "jsonwebtoken";

const activeSessions = new Map(); // In-memory store for active sessions

export function middleware(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1] || "";
  const pathname = request.nextUrl.pathname;

  console.log("Middleware triggered for path:", pathname);

  if (!token) {
    console.log("No token provided");
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, departmentId, userId } = decoded;

    console.log("Token decoded:", decoded);

    // Track active session
    if (!activeSessions.has(userId)) {
      activeSessions.set(userId, Date.now());
      console.log(`New active session added for user: ${userId}`);
    }

    // Admin access
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.log(`Access denied to admin path for user: ${userId} with role: ${role}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Manager access
    if (pathname.startsWith("/manager") && role === "employee") {
      console.log(`Access denied to manager path for employee: ${userId}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Employee profile access (can only view own profile)
    if (pathname.startsWith("/employee/profile") && role !== "employee") {
      const profileId = pathname.split("/").pop();
      if (profileId !== userId) {
        console.log(`Employee profile access denied. User: ${userId}, Profile: ${profileId}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Optional: Log allowed access
    console.log(`Access granted for user: ${userId} on path: ${pathname}`);
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token or error verifying token:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/employee/profile/:path*"],
};
