"use client"

import type React from "react"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { blockDates } from "@/app/actions/admin-actions"
import { toast } from "@/components/ui/use-toast"

export function DateBlocker({ onSuccess }: { onSuccess?: () => void }) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleStartDateSelect = (selectedDate: Date | undefined) => {
    setStartDate(selectedDate)
    if (selectedDate && (!endDate || selectedDate > endDate)) {
      setEndDate(addDays(selectedDate, 1))
    }
    setError(null)
  }

  const handleEndDateSelect = (selected: Date | undefined) => {
    setEndDate(selected)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    console.log("🔍 Form submitted - Block Dates button clicked")

    if (!startDate || !endDate) {
      console.log("❌ Validation failed: Missing dates", { startDate, endDate })
      setError("Please select both start and end dates.")
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    console.log("⏳ Setting isSubmitting to true")

    // Format dates for display in notifications
    const formattedStartDate = format(startDate, "MMM d, yyyy")
    const formattedEndDate = format(endDate, "MMM d, yyyy")

    // Show pending notification
    toast({
      title: "Blocking Dates",
      description: `Blocking dates from ${formattedStartDate} to ${formattedEndDate}${reason ? ` (${reason})` : ""}...`,
    })

    try {
      // Debug info
      const requestData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: reason || "Blocked by admin",
      }

      console.log("📤 Preparing to call server action with data:", requestData)
      setDebugInfo(`Sending: ${JSON.stringify(requestData)}`)

      console.log("🚀 Calling blockDates server action")
      const result = await blockDates(requestData)
      console.log("📄 Server action result:", result)

      if (result.success) {
        console.log("✅ Block dates successful, document ID:", result.id)
        toast({
          title: "Dates Blocked Successfully",
          description: `Successfully blocked dates from ${formattedStartDate} to ${formattedEndDate}`,
          className: "bg-green-50 border-green-200 text-green-800",
        })

        // Reset form
        console.log("🔄 Resetting form fields")
        setStartDate(undefined)
        setEndDate(undefined)
        setReason("")
        setDebugInfo(`Success! Document ID: ${result.id || "unknown"}`)

        // Trigger refresh
        console.log("🔄 Triggering refresh")
        setRefreshTrigger((prev) => prev + 1)

        // Call onSuccess callback if provided
        if (onSuccess) {
          console.log("📣 Calling onSuccess callback")
          onSuccess()
        }
      } else {
        console.log("❌ Block dates failed:", result)
        setError(result.message || "Failed to block dates. Please try again.")
        setDebugInfo(`Error: ${JSON.stringify(result)}`)

        toast({
          title: "Failed to Block Dates",
          description: result.message || "Failed to block dates",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Exception during block dates:", error)
      setError("An unexpected error occurred. Please try again.")
      setDebugInfo(`Exception: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log("⏳ Setting isSubmitting to false")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                disabled={!startDate}
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
                  // Can't select dates before the start date
                  return startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Maintenance, External booking, etc."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#E9A23B] hover:bg-[#d89328]"
        disabled={isSubmitting || !startDate || !endDate}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Blocking Dates...
          </>
        ) : (
          "Block These Dates"
        )}
      </Button>

      {debugInfo && showDebug && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto">
          <p>Debug Info:</p>
          <pre>{debugInfo}</pre>
        </div>
      )}

      {debugInfo && (
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)} className="text-xs text-gray-500">
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
      )}
    </form>
  )
}
