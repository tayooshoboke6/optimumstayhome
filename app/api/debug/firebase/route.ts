import { NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Test Firebase connection
    const testCollection = collection(db, "bookings")
    const snapshot = await getDocs(testCollection)

    return NextResponse.json({
      success: true,
      message: "Firebase connection successful",
      bookingsCount: snapshot.docs.length,
      bookingIds: snapshot.docs.map((doc) => doc.id),
    })
  } catch (error: any) {
    console.error("Firebase connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        errorCode: error.code,
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      },
      { status: 500 },
    )
  }
}
