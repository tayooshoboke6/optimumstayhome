import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    console.log("API: Static blocked dates response for export compatibility")
    
    // For static export, we can't make actual Firestore queries
    // Return a static response with empty dates array
    // The actual data will be fetched client-side after hydration
    
    return NextResponse.json({
      success: true,
      count: 0,
      dates: [],
      note: "This is a static response for compatibility with static export. Actual blocked dates will be fetched client-side after hydration."
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("API: Error fetching blocked dates:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 },
    )
  }
}
