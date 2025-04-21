import { NextResponse } from "next/server"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Test writing to Firestore
    const testDoc = await addDoc(collection(db, "test"), {
      message: "Test write successful",
      timestamp: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: "Test write to Firestore successful",
      docId: testDoc.id,
    })
  } catch (error: any) {
    console.error("Test write to Firestore failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        errorCode: error.code,
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      },
      { status: 500 },
    )
  }
}
