import { NextResponse } from "next/server"
import { auth, firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    // Check if Firebase Admin services are available
    const isAuthAvailable = !!auth;
    const isFirestoreAvailable = !!firestore;
    
    // Return status without actually making any Firebase calls
    return NextResponse.json({
      success: true,
      message: "Firebase debug endpoint",
      status: {
        authAvailable: isAuthAvailable,
        firestoreAvailable: isFirestoreAvailable,
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Firebase debug endpoint error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
