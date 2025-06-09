import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuth } from "@/lib/firebase-admin-vercel"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    console.log("Session API route called")
    const auth = getAuth()

    // Check if Firebase Admin SDK is initialized
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK not initialized. Check server environment variables.",
        },
        { status: 500 },
      )
    }

    // Get the ID token from the request
    const { idToken } = await request.json()

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

    // Set the cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ success: false }, { status: 401 })
  }
}

export async function DELETE() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return NextResponse.json({ success: true })
}
