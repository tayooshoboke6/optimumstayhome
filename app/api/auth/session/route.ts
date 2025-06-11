import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    console.log("Static session API response for export compatibility")
    
    // For static export, we return a static response
    // The actual session verification will be performed client-side after hydration
    return NextResponse.json(
      {
        success: true,
        message: "This is a static response for compatibility with static export. Actual session verification will be performed client-side after hydration.",
        isAdmin: false,
        uid: "static-uid-placeholder",
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in static session API:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return NextResponse.json({ success: true })
}
