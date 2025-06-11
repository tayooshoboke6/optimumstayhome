import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    console.log("Static admin creation endpoint for export compatibility")

    // For static export, we return a static response
    // The actual admin creation will be performed client-side after hydration
    return NextResponse.json(
      {
        success: true,
        message: "This is a static response for compatibility with static export. Actual admin creation will be performed client-side after hydration.",
      },
      { status: 200 },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in static admin creation endpoint:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
