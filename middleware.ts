import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("Middleware running for path:", request.nextUrl.pathname)

  // Get the session cookie
  const sessionCookie = request.cookies.get("session")?.value
  console.log("Session cookie exists:", !!sessionCookie)

  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    console.log("Protecting admin dashboard route")

    // If there's no session cookie, redirect to login
    if (!sessionCookie) {
      console.log("No session cookie found, redirecting to login")
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    console.log("Session cookie found, allowing access")
    return NextResponse.next()
  }

  // For all other routes, continue
  console.log("Not a protected route, continuing")
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
}
