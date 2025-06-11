import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import admin, { auth, firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: Request) {
  console.log("🔍 API: Static block-dates response for export compatibility")

  try {
    // For static export, we return a static response
    // The actual blocking dates operation will be performed client-side after hydration
    return NextResponse.json({
      success: true,
      message: "This is a static response for compatibility with static export. Actual date blocking will be performed client-side after hydration.",
    })

    // Verify the session cookie
    if (!auth) {
      console.log("❌ API: Firebase Auth service unavailable")
      return NextResponse.json({ success: false, message: "Auth service unavailable" }, { status: 500 })
    }

    try {
      console.log("🔐 API: Verifying session cookie")
      // Verify the session cookie and get the decoded claims
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
      console.log("✅ API: Session cookie verified, claims:", decodedClaims)

      // Check if the user is an admin
      console.log("🔍 API: Checking admin claim:", decodedClaims.admin)
      if (!decodedClaims.admin) {
        console.log("❌ API: User is not an admin, returning 403")
        return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ API: Error in static block-dates API:", errorMessage)
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { startDate, endDate, reason } = body

    console.log("📄 API: Received block dates request with data:", { startDate, endDate, reason })

    // Validate required fields
    if (!startDate || !endDate) {
      console.log("❌ API: Missing required fields")
      return NextResponse.json({ success: false, message: "startDate and endDate are required" }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log("❌ API: Invalid date format")
      return NextResponse.json({ success: false, message: "Invalid date format" }, { status: 400 })
    }

    // Add to Firestore using Admin SDK
    console.log("💾 API: Adding document to blockedDates collection")
    
    if (!firestore) {
      console.log("❌ API: Firestore service unavailable")
      return NextResponse.json({ success: false, message: "Database service unavailable" }, { status: 500 })
    }
    
    const docRef = await firestore.collection("blockedDates").add({
      startDate,
      endDate,
      reason: reason || "Blocked via API",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log("✅ API: Successfully added blocked dates with ID:", docRef.id)

    return NextResponse.json({
      success: true,
      message: "Dates blocked successfully",
      id: docRef.id,
    })
  } catch (error) {
    console.error("❌ API: Error blocking dates:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
