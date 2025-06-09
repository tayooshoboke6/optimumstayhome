import { NextResponse } from "next/server"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    // For static export, we return a static response
    // The actual Firestore write will be performed client-side after hydration
    console.log("API: Static test-write response for export compatibility")
    
    return NextResponse.json({
      success: true,
      message: "Static test write response for export compatibility",
      docId: "static-doc-id-placeholder",
      note: "This is a static response for compatibility with static export. Actual Firestore operations will be performed client-side after hydration."
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Test write API error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
