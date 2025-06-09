import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    // For static export, we can't make actual Firestore queries
    // Check if Firestore service is available
    const isFirestoreAvailable = !!firestore;
    console.log("Firestore service available:", isFirestoreAvailable);
    
    return NextResponse.json({
      success: true,
      message: "Firestore static test",
      firestoreAvailable: isFirestoreAvailable,
      note: "This is a static response for compatibility with static export"
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Firestore test failed:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 },
    )
  }
}
