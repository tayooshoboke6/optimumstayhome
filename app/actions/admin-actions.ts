"use server"
import { cookies } from "next/headers"
import { getFirestore } from "@/lib/firebase-admin-json"

interface BlockDatesParams {
  startDate: string
  endDate: string
  reason: string
}

export async function blockDates({ startDate, endDate, reason }: BlockDatesParams) {
  console.log("🔍 SERVER ACTION: blockDates server action called")

  try {
    console.log("📄 SERVER ACTION: blockDates action called with:", { startDate, endDate, reason })

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("❌ SERVER ACTION: Invalid date format:", { startDate, endDate })
      return {
        success: false,
        message: "Invalid date format",
      }
    }

    if (start > end) {
      console.error("❌ SERVER ACTION: Start date after end date:", { start, end })
      return {
        success: false,
        message: "Start date cannot be after end date",
      }
    }

    // Get session cookie to verify admin status
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      console.error("❌ SERVER ACTION: No session cookie found")
      return {
        success: false,
        message: "Authentication required",
      }
    }

    // Use Firebase Admin SDK to bypass security rules
    const adminDb = getFirestore()

    if (!adminDb) {
      console.error("❌ SERVER ACTION: Firebase Admin SDK not initialized")
      return {
        success: false,
        message: "Server configuration error",
      }
    }

    // Add to Firestore using Admin SDK
    try {
      console.log("💾 SERVER ACTION: Attempting to add blocked dates using Admin SDK")

      const docRef = await adminDb.collection("blockedDates").add({
        startDate,
        endDate,
        reason: reason || "Blocked by admin",
        createdAt: new Date(),
      })

      console.log("✅ SERVER ACTION: Successfully added blocked dates with ID:", docRef.id)
      return {
        success: true,
        message: "Dates blocked successfully",
        id: docRef.id,
      }
    } catch (firestoreError) {
      console.error("❌ SERVER ACTION: Firestore error when blocking dates:", firestoreError)
      return {
        success: false,
        message: "Database error: Unable to save blocked dates",
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError),
      }
    }
  } catch (error) {
    console.error("❌ SERVER ACTION: Error blocking dates:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      error: String(error),
    }
  }
}
