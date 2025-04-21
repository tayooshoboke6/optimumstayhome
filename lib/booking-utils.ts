/**
 * Generates a user-friendly booking ID
 * Format: OST-XXXXX (where X is alphanumeric)
 */
export function generateBookingId(): string {
  const prefix = "OST-"
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed similar looking characters (0/O, 1/I)
  const idLength = 6

  let result = prefix
  for (let i = 0; i < idLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

/**
 * Validates a booking ID format
 */
export function isValidBookingId(id: string): boolean {
  const regex = /^OST-[A-Z0-9]{6}$/
  return regex.test(id)
}

import { addDoc, collection, getDocs, query, Timestamp, where, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"
import { addDays } from "date-fns"

// Function to update the bookedDates collection when a booking is confirmed
export async function updateBookedDatesForBooking(
  bookingId: string,
  checkIn: Date | string,
  checkOut: Date | string,
  isConfirmed: boolean
) {
  try {
    // Normalize dates
    const startDate = typeof checkIn === "string" ? new Date(checkIn) : checkIn
    const endDate = typeof checkOut === "string" ? new Date(checkOut) : checkOut

    // If booking is confirmed, add the dates to the bookedDates collection
    if (isConfirmed) {
      // Add a single document covering the date range
      await addDoc(collection(db, "bookedDates"), {
        bookingId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: Timestamp.now(),
      })

      console.log(`Added booked dates for booking ${bookingId}`)
    } else {
      // If booking is not confirmed (cancelled/rejected), remove the dates from bookedDates
      const bookedDatesRef = collection(db, "bookedDates")
      const q = query(bookedDatesRef, where("bookingId", "==", bookingId))
      const querySnapshot = await getDocs(q)

      // Delete all documents for this booking
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      console.log(`Removed booked dates for booking ${bookingId}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating booked dates:", error)
    return { success: false, error }
  }
}
