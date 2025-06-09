import { NextResponse } from "next/server"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cookies } from "next/headers"
import { getAuth } from "@/lib/firebase-admin-json"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: Request) {
  console.log("🔍 API: /api/admin/block-dates endpoint called")

  try {
    // Get the session cookie
    const cookiesList = cookies()
    const sessionCookie = cookiesList.get("session")?.value
    console.log("🍪 API: Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ API: No session cookie found, returning 401")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Verify the session cookie
    const auth = getAuth()
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
    } catch (error) {
      console.error("❌ API: Session verification failed:", error)
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
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

    // Add to Firestore
    console.log("💾 API: Adding document to blockedDates collection")
    const docRef = await addDoc(collection(db, "blockedDates"), {
      startDate,
      endDate,
      reason: reason || "Blocked via API",
      createdAt: serverTimestamp(),
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
