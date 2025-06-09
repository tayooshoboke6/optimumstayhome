import { NextResponse } from "next/server"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    console.log("API: Fetching blocked dates from Firestore...")
    const blockedDatesCollection = collection(db, "blockedDates")
    const blockedDatesQuery = query(blockedDatesCollection, orderBy("startDate", "desc"))
    const snapshot = await getDocs(blockedDatesQuery)

    console.log(`API: Found ${snapshot.docs.length} blocked date documents`)

    const dates = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason || "",
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      count: dates.length,
      dates,
    })
  } catch (error) {
    console.error("API: Error fetching blocked dates:", error)
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
