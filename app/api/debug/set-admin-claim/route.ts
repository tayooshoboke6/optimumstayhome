import { NextResponse } from "next/server"

// This is required for static export
export const dynamic = "force-static"

export async function POST(request: Request) {
  try {
    console.log("Static set-admin-claim API response for export compatibility")
    
    // For static export, we return a static response
    // The actual admin claim setting will be performed client-side after hydration
    return NextResponse.json({
      success: true,
      message: "This is a static response for compatibility with static export. Actual admin claim setting will be performed client-side after hydration.",
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in static set-admin-claim API:", errorMessage)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
