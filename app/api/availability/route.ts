import { type NextRequest, NextResponse } from "next/server"
import { firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

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

    // For static export, we can't make actual Firestore queries
    // Return a static response that indicates dates are available
    // The actual availability check will happen client-side after hydration
    
    return NextResponse.json({
      available: true,
      dates: {
        start: startDate,
        end: endDate,
      },
      note: "This is a static response. Actual availability will be checked client-side after hydration."
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error checking availability:", errorMessage)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
