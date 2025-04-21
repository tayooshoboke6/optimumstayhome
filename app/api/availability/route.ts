import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }

    // Parse dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    // Query for bookings that overlap with the requested dates
    const bookingsRef = collection(db, "bookings")

    // We need to find bookings where:
    // 1. Check-in date is before the requested end date AND
    // 2. Check-out date is after the requested start date
    // This will find all bookings that overlap with the requested date range
    const bookingsQuery = query(
      bookingsRef,
      where("status", "==", "confirmed"),
      where("checkIn", "<=", endDate),
      where("checkOut", ">=", startDate),
    )

    const bookingsSnapshot = await getDocs(bookingsQuery)

    // Check for blocked dates that overlap with the requested dates
    const blockedDatesRef = collection(db, "blockedDates")
    const blockedDatesQuery = query(
      blockedDatesRef,
      where("startDate", "<=", endDate),
      where("endDate", ">=", startDate),
    )

    const blockedDatesSnapshot = await getDocs(blockedDatesQuery)

    // If there are any bookings or blocked dates in this range, the dates are not available
    const isAvailable = bookingsSnapshot.empty && blockedDatesSnapshot.empty

    return NextResponse.json({
      available: isAvailable,
      dates: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
