import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuth } from "@/lib/firebase-admin-json"

export async function GET() {
  try {
    // Get the session cookie
    const cookiesList = cookies()
    const sessionCookie = cookiesList.get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({
        isLoggedIn: false,
        isAdmin: false,
        message: "No session cookie found",
      })
    }

    // Verify the session cookie
    const auth = getAuth()
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
