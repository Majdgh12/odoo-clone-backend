import NextResponse from "next/server";
import jwt from "jsonwebtoken";

// This function can be marked `async` if using `await` inside
const activeSessions = new Map(); // In-memory store for active sessions

export function middleware(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1] || "";
  const pathname = request.nextUrl.pathname;
  if (!token) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, departmentId, userId } = decoded; // Extract user role and other info from token
    if (!activeSessions.has(userId)) {
      activeSessions.set(userId, Date.now()); // Store session with timestamp
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/manager") && role === "employee") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/employee/profile") && role !== "employee") {
      const profileId = pathname.split("/").pop();
      if (profileId !== userId) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path* , /manager/:path* , /employee/profile/:path*"],
};
