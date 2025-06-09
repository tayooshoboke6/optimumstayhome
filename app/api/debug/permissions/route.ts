import { NextResponse } from "next/server"
import { auth, firestore } from "@/lib/firebase-admin-ultimate"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  try {
    // For static export, we can't check authentication state
    // Check if Firebase Admin services are available
    const isAuthAvailable = !!auth;
    const isFirestoreAvailable = !!firestore;
    
    return NextResponse.json({
      success: true,
      message: "Static permissions check",
      servicesAvailable: {
        auth: isAuthAvailable,
        firestore: isFirestoreAvailable
      },
      note: "This is a static response for compatibility with static export. Authentication state will be checked client-side after hydration."
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Permissions check error:", errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
