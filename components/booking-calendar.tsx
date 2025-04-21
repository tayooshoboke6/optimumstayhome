"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Booking {
  id: string
  name: string
  checkIn: Date
  checkOut: Date
  status: string
}

interface BlockedDate {
  id: string
  startDate: Date
  endDate: Date
  reason: string
}

interface BookingCalendarProps {
  bookings: Booking[]
}

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    try {
      setLoading(true)
      const blockedDatesCollection = collection(db, "blockedDates")
      const blockedDatesQuery = query(blockedDatesCollection)
      const snapshot = await getDocs(blockedDatesQuery)

      const dates = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          reason: data.reason,
        }
      })

      setBlockedDates(dates)
    } catch (err) {
      console.error("Error fetching blocked dates:", err)
    } finally {
      setLoading(false)
    }
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add empty cells for days of the week before the first day of the month
  const startDay = monthStart.getDay()
  const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1 // Adjust for Monday as first day of week

  // Get bookings for current month
  const currentMonthBookings = bookings.filter(
    (booking) =>
      isSameMonth(booking.checkIn, currentMonth) ||
      isSameMonth(booking.checkOut, currentMonth) ||
      (booking.checkIn < monthStart && booking.checkOut > monthEnd),
  )

  // Get blocked dates for current month
  const currentMonthBlockedDates = blockedDates.filter(
    (blockedDate) =>
      isSameMonth(blockedDate.startDate, currentMonth) ||
      isSameMonth(blockedDate.endDate, currentMonth) ||
      (blockedDate.startDate < monthStart && blockedDate.endDate > monthEnd),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days from previous month */}
        {Array.from({ length: daysFromPrevMonth }).map((_, index) => (
          <div key={`prev-${index}`} className="h-24 border rounded-md bg-gray-50 p-1" />
        ))}

        {/* Days of current month */}
        {monthDays.map((day) => {
          // Check if day has any bookings
          const dayBookings = currentMonthBookings.filter((booking) =>
            isWithinInterval(day, { start: booking.checkIn, end: booking.checkOut }),
          )

          // Check if day is blocked
          const dayBlocked = currentMonthBlockedDates.some((blockedDate) =>
            isWithinInterval(day, { start: blockedDate.startDate, end: blockedDate.endDate }),
          )

          // Check if day is check-in or check-out
          const checkIns = currentMonthBookings.filter((booking) => isSameDay(day, booking.checkIn))
          const checkOuts = currentMonthBookings.filter((booking) => isSameDay(day, booking.checkOut))

          // Check if day is start or end of blocked period
          const blockStarts = currentMonthBlockedDates.filter((blockedDate) => isSameDay(day, blockedDate.startDate))
          const blockEnds = currentMonthBlockedDates.filter((blockedDate) => isSameDay(day, blockedDate.endDate))

          return (
            <div
              key={day.toString()}
              className={cn(
                "h-24 border rounded-md p-1 overflow-hidden",
                dayBookings.length > 0 && "bg-gray-50",
                dayBlocked && "bg-red-50",
              )}
            >
              <div className="text-right text-sm">{format(day, "d")}</div>

              <div className="mt-1 space-y-1">
                {blockStarts.map((blockedDate) => (
                  <div key={`block-start-${blockedDate.id}`} className="text-xs truncate">
                    <Badge variant="outline" className="text-[10px] font-normal border-l-4 border-l-red-500 bg-red-50">
                      Block Start: {blockedDate.reason || "Admin Block"}
                    </Badge>
                  </div>
                ))}

                {blockEnds.map((blockedDate) => (
                  <div key={`block-end-${blockedDate.id}`} className="text-xs truncate">
                    <Badge variant="outline" className="text-[10px] font-normal border-r-4 border-r-red-500 bg-red-50">
                      Block End: {blockedDate.reason || "Admin Block"}
                    </Badge>
                  </div>
                ))}

                {checkIns.map((booking) => (
                  <div key={`in-${booking.id}`} className="text-xs truncate">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal border-l-4",
                        booking.status === "confirmed" && "border-l-green-500",
                        booking.status === "pending" && "border-l-yellow-500",
                        booking.status === "rejected" && "border-l-red-500",
                      )}
                    >
                      Check-in: {booking.name}
                    </Badge>
                  </div>
                ))}

                {checkOuts.map((booking) => (
                  <div key={`out-${booking.id}`} className="text-xs truncate">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal border-r-4",
                        booking.status === "confirmed" && "border-r-green-500",
                        booking.status === "pending" && "border-r-yellow-500",
                        booking.status === "rejected" && "border-r-red-500",
                      )}
                    >
                      Check-out: {booking.name}
                    </Badge>
                  </div>
                ))}

                {dayBookings
                  .filter((booking) => !isSameDay(day, booking.checkIn) && !isSameDay(day, booking.checkOut))
                  .map((booking) => (
                    <div key={`stay-${booking.id}`} className="text-xs truncate">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-normal",
                          booking.status === "confirmed" && "bg-green-50 text-green-700 border-green-200",
                          booking.status === "pending" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          booking.status === "rejected" && "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {booking.name}
                      </Badge>
                    </div>
                  ))}

                {/* Show blocked date indicator if not start or end */}
                {dayBlocked &&
                  !blockStarts.some((b) => isSameDay(day, b.startDate)) &&
                  !blockEnds.some((b) => isSameDay(day, b.endDate)) && (
                    <div className="text-xs truncate">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal bg-red-50 text-red-700 border-red-200"
                      >
                        Blocked
                      </Badge>
                    </div>
                  )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Rejected/Blocked</span>
        </div>
      </div>
    </div>
  )
}
