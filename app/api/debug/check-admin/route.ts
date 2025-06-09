import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({
        isLoggedIn: false,
        isAdmin: false,
        message: "No session cookie found",
      })
    }

    // Verify the session cookie
    if (!auth) {
      return NextResponse.json(
        {
          error: "Firebase Auth service unavailable",
        },
        { status: 500 },
      )
    }

    try {
      // Verify the session cookie and get the decoded claims
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

      return NextResponse.json({
        isLoggedIn: true,
        isAdmin: !!decodedClaims.admin,
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        claims: decodedClaims,
      })
    } catch (error) {
      return NextResponse.json(
        {
          isLoggedIn: false,
          isAdmin: false,
          error: "Invalid session",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error checking admin status",
      },
      { status: 500 },
    )
  }
}
