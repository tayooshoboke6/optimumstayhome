"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useUnavailableDates } from "@/hooks/use-unavailable-dates"
import { Loader2 } from "lucide-react"
import { addDays } from "date-fns"

export function HomepageCalendar() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { unavailableDates, isDateUnavailable, loading } = useUnavailableDates()

  // Handle date selection
  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      setEndDate(undefined)
      return
    }

    // If no date is selected yet, set it as the start date
    if (!date) {
      setDate(selectedDate)
      // Set end date to start date + 1 day by default
      setEndDate(addDays(selectedDate, 1))
    }
    // If start date is already selected and the new selection is after it, set as end date
    else if (selectedDate > date) {
      setEndDate(selectedDate)
    }
    // If the new selection is before or equal to the current start date, reset and use as new start date
    else {
      setDate(selectedDate)
      setEndDate(addDays(selectedDate, 1))
    }
  }

  // Create a disabled dates function that checks if a date is unavailable
  const isDateDisabled = (date: Date) => {
    // Disable dates in the past
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
    // Disable unavailable dates
    const isUnavailable = isDateUnavailable(date)
    return isPast || isUnavailable
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B]" />
        </div>
      )}

      <Calendar
        mode="range"
        selected={{
          from: date,
          to: endDate,
        }}
        onSelect={(range) => {
          if (range?.from) {
            setDate(range.from)
          } else {
            setDate(undefined)
          }
          if (range?.to) {
            setEndDate(range.to)
          } else {
            setEndDate(undefined)
          }
        }}
        disabled={isDateDisabled}
        modifiers={{
          unavailable: unavailableDates,
        }}
        modifiersStyles={{
          unavailable: {
            textDecoration: "line-through",
            backgroundColor: "rgb(254 226 226)", // Light red background
            color: "rgb(185 28 28)", // Dark red text
          },
        }}
        className="rounded-md border"
      />
    </div>
  )
}
