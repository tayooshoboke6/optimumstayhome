import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies"
import admin from "@/lib/firebase-admin-ultimate"

// Get the auth instance safely
const getAuth = () => {
  try {
    return admin.auth()
  } catch (error) {
    console.error("Failed to get auth instance:", error)
    return null
  }
}

// Enable dynamic API route for server-side session handling
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "No ID token provided" },
        { status: 400 }
      )
    }

    // Get the auth instance
    const authInstance = getAuth()
    if (!authInstance) {
      throw new Error("Failed to initialize Firebase Auth")
    }

    // Verify the ID token
    const decodedToken = await authInstance.verifyIdToken(idToken)
    const uid = decodedToken.uid
    
    // Check if user is admin
    const isAdmin = decodedToken.admin === true
    
    // Create a session cookie (expires in 14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days in milliseconds
    const sessionCookie = await authInstance.createSessionCookie(idToken, { expiresIn })
    
    // Create response with session data
    const response = NextResponse.json(
      {
        success: true,
        isAdmin,
        uid,
      },
      { status: 200 }
    )
    
    // Set the session cookie in the response
    response.cookies.set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
    
    return response
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating session:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 401 },
    )
  }
}

export async function DELETE() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return NextResponse.json({ success: true })
}
