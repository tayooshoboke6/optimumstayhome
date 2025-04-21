"use server"
import { cookies } from "next/headers"
import { getFirestore } from "@/lib/firebase-admin-json"

export async function updatePrice(price: number) {
  console.log("🔍 SERVER ACTION: updatePrice called with:", price)

  try {
    if (isNaN(price) || price <= 0) {
      return {
        success: false,
        message: "Please enter a valid price",
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

    // Update price in Firestore using Admin SDK
    try {
      console.log("💾 SERVER ACTION: Updating price using Admin SDK")

      await adminDb.collection("settings").doc("apartment").set(
        {
          price: price,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      console.log("✅ SERVER ACTION: Successfully updated price")
      return {
        success: true,
        message: "Price updated successfully",
      }
    } catch (firestoreError) {
      console.error("❌ SERVER ACTION: Firestore error when updating price:", firestoreError)
      return {
        success: false,
        message: "Database error: Unable to update price",
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError),
      }
    }
  } catch (error) {
    console.error("❌ SERVER ACTION: Error updating price:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      error: String(error),
    }
  }
}

export async function updateMinimumNights(minimumNights: number) {
  console.log("🔍 SERVER ACTION: updateMinimumNights called with:", minimumNights)

  try {
    if (isNaN(minimumNights) || minimumNights <= 0) {
      return {
        success: false,
        message: "Please select a valid minimum nights value",
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

    // Update minimum nights in Firestore using Admin SDK
    try {
      console.log("💾 SERVER ACTION: Updating minimum nights using Admin SDK")

      await adminDb.collection("settings").doc("apartment").set(
        {
          minimumNights: minimumNights,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      console.log("✅ SERVER ACTION: Successfully updated minimum nights")
      return {
        success: true,
        message: "Minimum nights updated successfully",
      }
    } catch (firestoreError) {
      console.error("❌ SERVER ACTION: Firestore error when updating minimum nights:", firestoreError)
      return {
        success: false,
        message: "Database error: Unable to update minimum nights",
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError),
      }
    }
  } catch (error) {
    console.error("❌ SERVER ACTION: Error updating minimum nights:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      error: String(error),
    }
  }
}
