import { NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

export async function GET() {
  try {
    // Get current user
    const currentUser = auth.currentUser

    // Test Firebase connection
    const testCollection = collection(db, "bookings")

    try {
      const snapshot = await getDocs(testCollection)

      return NextResponse.json({
        success: true,
        message: "Firebase connection successful",
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid || "Not authenticated",
        bookingsCount: snapshot.docs.length,
        bookingIds: snapshot.docs.map((doc) => doc.id),
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid || "Not authenticated",
        error: error.message || "Unknown error",
        errorCode: error.code,
      })
    }
  } catch (error: any) {
    console.error("Debug endpoint error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
