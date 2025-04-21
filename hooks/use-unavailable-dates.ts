"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { addDays, isSameDay } from "date-fns"

export function useUnavailableDates() {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUnavailableDates() {
      try {
        setLoading(true)
        setError(null)
        const unavailable: Date[] = []

        // Get blocked dates
        try {
          const blockedDatesRef = collection(db, "blockedDates")
          const blockedDatesSnapshot = await getDocs(blockedDatesRef)

          // Process blocked dates
          blockedDatesSnapshot.forEach((doc) => {
            const blockedDate = doc.data()
            const startDate = new Date(blockedDate.startDate)
            const endDate = new Date(blockedDate.endDate)

            // Add all dates between start and end (inclusive)
            let currentDate = new Date(startDate)
            while (currentDate <= endDate) {
              unavailable.push(new Date(currentDate))
              currentDate = addDays(currentDate, 1)
            }
          })
        } catch (blockError) {
          console.error("Error fetching blocked dates:", blockError)
          // Continue with what we have, don't fail completely
        }

        // Get booked dates from the public bookedDates collection
        try {
          const bookedDatesRef = collection(db, "bookedDates")
          const bookedDatesSnapshot = await getDocs(bookedDatesRef)

          // Process booked dates
          bookedDatesSnapshot.forEach((doc) => {
            const bookedDate = doc.data()
            // Check if it's just a single date or a range
            if (bookedDate.date) {
              unavailable.push(new Date(bookedDate.date))
            } else if (bookedDate.startDate && bookedDate.endDate) {
              const startDate = new Date(bookedDate.startDate)
              const endDate = new Date(bookedDate.endDate)

              // Add all dates between start and end (inclusive)
              let currentDate = new Date(startDate)
              while (currentDate <= endDate) {
                unavailable.push(new Date(currentDate))
                currentDate = addDays(currentDate, 1)
              }
            }
          })
        } catch (bookedError) {
          console.error("Error fetching booked dates:", bookedError)
          // Continue with what we have, don't fail completely
        }

        // Try to fetch confirmed bookings directly as a fallback (for admin users)
        try {
          const bookingsRef = collection(db, "bookings")
          const bookingsQuery = query(bookingsRef, where("status", "==", "confirmed"))
          const bookingsSnapshot = await getDocs(bookingsQuery)

          // Process bookings
          bookingsSnapshot.forEach((doc) => {
            const booking = doc.data()
            const checkIn = new Date(booking.checkIn)
            const checkOut = new Date(booking.checkOut)

            // Add all dates between check-in and check-out (inclusive)
            let currentDate = new Date(checkIn)
            while (currentDate <= checkOut) {
              unavailable.push(new Date(currentDate))
              currentDate = addDays(currentDate, 1)
            }
          })
        } catch (bookError) {
          // This is expected for public users, so don't fail completely
          // Log is commented out to avoid console noise for public users
          // console.error("Error fetching confirmed bookings:", bookError)
        }

        setUnavailableDates(unavailable)
      } catch (err) {
        console.error("Error fetching unavailable dates:", err)
        setError("Failed to load availability data")
      } finally {
        setLoading(false)
      }
    }

    fetchUnavailableDates()
  }, [])

  // Helper function to check if a date is unavailable
  const isDateUnavailable = (date: Date): boolean => {
    return unavailableDates.some((unavailableDate) => isSameDay(unavailableDate, date))
  }

  // Helper function to check if a date range has any unavailable dates
  const isRangeAvailable = (startDate: Date, endDate: Date): boolean => {
    if (!startDate || !endDate) return true

    // If either the start or end date is unavailable, the range is unavailable
    if (isDateUnavailable(startDate) || isDateUnavailable(endDate)) {
      return false
    }

    // Check each date in the range
    let currentDate = addDays(startDate, 1) // Start from the day after check-in
    const lastDate = endDate // End at check-out date

    while (currentDate < lastDate) {
      if (isDateUnavailable(currentDate)) {
        return false
      }
      currentDate = addDays(currentDate, 1)
    }

    return true
  }

  // Find the next available check-out date after a given check-in date
  const findNextAvailableCheckoutDate = (checkInDate: Date, minimumNights = 1): Date | null => {
    if (!checkInDate) return null

    let proposedCheckout = addDays(checkInDate, minimumNights)

    // Try to find an available date starting from minimum nights
    for (let i = 0; i < 30; i++) {
      // Limit to 30 days to avoid infinite loop
      if (!isDateUnavailable(proposedCheckout) && isRangeAvailable(checkInDate, proposedCheckout)) {
        return proposedCheckout
      }
      proposedCheckout = addDays(proposedCheckout, 1)
    }

    return null // No available checkout date found within reasonable range
  }

  return {
    unavailableDates,
    isDateUnavailable,
    isRangeAvailable,
    findNextAvailableCheckoutDate,
    loading,
    error,
  }
}
