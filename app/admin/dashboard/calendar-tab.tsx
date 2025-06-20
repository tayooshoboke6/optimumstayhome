"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { BookingCalendar } from "@/components/booking-calendar"
import { DateBlocker } from "@/components/date-blocker"
import { BlockedDatesList } from "@/components/blocked-dates-list"
import { toast } from "@/components/ui/use-toast"

interface CalendarTabProps {
  bookings: any[]
  loading: boolean
  error: string | null
}

export function CalendarTab({ bookings, loading, error }: CalendarTabProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [testingFirestore, setTestingFirestore] = useState(false)

  const handleDateBlockSuccess = () => {
    // Increment refresh trigger to cause BlockedDatesList to refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  const testFirestoreWrite = async () => {
    setTestingFirestore(true)
    try {
      // Use absolute URL to fix the invalid URL error
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/debug/test-write`)
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Test successful",
          description: `Successfully wrote test document with ID: ${data.docId}`,
        })
      } else {
        toast({
          title: "Test failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Could not connect to test endpoint",
        variant: "destructive",
      })
    } finally {
      setTestingFirestore(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
          <CardDescription>View all bookings in calendar format.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <BookingCalendar bookings={bookings} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Block Dates</CardTitle>
            <CardDescription>Block dates for maintenance or external bookings.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={testFirestoreWrite} disabled={testingFirestore}>
            {testingFirestore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
              </>
            ) : (
              "Test Firestore"
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <DateBlocker onSuccess={handleDateBlockSuccess} />
        </CardContent>
      </Card>

      <Card key={`blocked-dates-${refreshTrigger}`}>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>Manage your blocked dates.</CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedDatesList />
        </CardContent>
      </Card>
    </div>
  )
}
