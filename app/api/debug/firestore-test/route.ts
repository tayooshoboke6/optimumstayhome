import { NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Test reading from Firestore
    console.log("Testing Firestore read...")
    const testQuery = query(collection(db, "test"), limit(1))
    const snapshot = await getDocs(testQuery)
    console.log(`Read test successful, found ${snapshot.docs.length} documents`)

    // Test writing to Firestore
    console.log("Testing Firestore write...")
    const docRef = await addDoc(collection(db, "test"), {
      message: "Test write successful",
      timestamp: new Date().toISOString(),
    })
    console.log("Write test successful, document ID:", docRef.id)

    return NextResponse.json({
      success: true,
      message: "Firestore read and write tests successful",
      readCount: snapshot.docs.length,
      writeId: docRef.id,
    })
  } catch (error: any) {
    console.error("Firestore test failed:", error)

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
