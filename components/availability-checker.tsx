"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { useUnavailableDates } from "@/hooks/use-unavailable-dates"

export function AvailabilityChecker() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<{
    checked: boolean
    available: boolean
    message: string
  }>({
    checked: false,
    available: false,
    message: "",
  })
  const [minimumNights, setMinimumNights] = useState<number>(2)
  const [rangeValidationError, setRangeValidationError] = useState<string | null>(null)

  // Get unavailable dates
  const {
    unavailableDates,
    isDateUnavailable,
    isRangeAvailable,
    findNextAvailableCheckoutDate,
    loading: loadingDates,
    error: datesError,
  } = useUnavailableDates()

  useEffect(() => {
    async function fetchMinimumNights() {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "apartment"))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setMinimumNights(data.minimumNights || 2)
        }
      } catch (error) {
        console.error("Error fetching minimum nights:", error)
      }
    }

    fetchMinimumNights()
  }, [])

  // Validate date range when dates change
  useEffect(() => {
    if (date && endDate) {
      // Check if the range meets minimum nights requirement
      const diffTime = Math.abs(endDate.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < minimumNights) {
        setRangeValidationError(`Minimum stay is ${minimumNights} ${minimumNights === 1 ? "night" : "nights"}.`)
      } else if (!isRangeAvailable(date, endDate)) {
        setRangeValidationError("Your selected date range includes unavailable dates.")
      } else {
        setRangeValidationError(null)
      }
    } else {
      setRangeValidationError(null)
    }
  }, [date, endDate, minimumNights, isRangeAvailable])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setAvailability({
      checked: false,
      available: false,
      message: "",
    })

    if (selectedDate) {
      // Try to find the next available checkout date
      const nextAvailableCheckout = findNextAvailableCheckoutDate(selectedDate, minimumNights)
      if (nextAvailableCheckout) {
        setEndDate(nextAvailableCheckout)
      } else {
        // If no available checkout date found, just set to minimum nights
        setEndDate(addDays(selectedDate, minimumNights))
      }
    } else {
      setEndDate(undefined)
    }
  }

  const handleEndDateSelect = (selected: Date | undefined) => {
    setEndDate(selected)
    setAvailability({
      checked: false,
      available: false,
      message: "",
    })

    // Validate the range when checkout date is selected
    if (date && selected) {
      if (!isRangeAvailable(date, selected)) {
        toast({
          title: "Warning",
          description: "Your selected date range includes unavailable dates.",
          variant: "destructive",
        })
      }
    }
  }

  const checkAvailability = async () => {
    if (!date || !endDate) return

    // Calculate number of nights
    const diffTime = Math.abs(endDate.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Check minimum nights
    if (diffDays < minimumNights) {
      toast({
        title: "Invalid date range",
        description: `Minimum stay is ${minimumNights} ${minimumNights === 1 ? "night" : "nights"}.`,
        variant: "destructive",
      })
      return
    }

    // Check if the range includes unavailable dates
    if (!isRangeAvailable(date, endDate)) {
      toast({
        title: "Invalid date range",
        description: "Your selected date range includes unavailable dates.",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
    try {
      // Since we've already checked with our local data, we can just set the result directly
      // But in a real app, you might still want to double-check with the server
      setAvailability({
        checked: true,
        available: true,
        message: "The apartment is available for your selected dates!",
      })
    } catch (error) {
      setAvailability({
        checked: true,
        available: false,
        message: "An error occurred while checking availability",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      {loadingDates && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#E9A23B] mr-2" />
          <span>Loading availability data...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Check-in Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                disabled={loadingDates}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  // Disable dates in the past
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                  // Disable unavailable dates
                  const isUnavailable = isDateUnavailable(date)
                  return isPast || isUnavailable
                }}
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
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Check-out Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                disabled={!date || loadingDates}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                disabled={(date) => {
                  // Disable dates before the check-in date
                  const isBeforeCheckIn = this.date && date <= this.date
                  // Disable unavailable dates
                  const isUnavailable = isDateUnavailable(date)
                  return isBeforeCheckIn || isUnavailable
                }}
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
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date range validation error */}
      {rangeValidationError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rangeValidationError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={checkAvailability}
        disabled={!date || !endDate || isChecking || loadingDates || !!rangeValidationError}
        className="w-full bg-[#E9A23B] hover:bg-[#d89328]"
      >
        {isChecking ? (
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="h-4 w-4 rounded-full border-2 border-t-white border-r-white border-b-white/40 border-l-white/40 animate-spin"></div>
            </div>
            <span>Checking...</span>
          </div>
        ) : (
          "Check Availability"
        )}
      </Button>

      {availability.checked && (
        <Alert
          variant={availability.available ? "default" : "destructive"}
          className={cn(
            availability.available
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200",
          )}
        >
          {availability.available ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>{availability.available ? "Available" : "Not Available"}</AlertTitle>
          <AlertDescription>{availability.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
