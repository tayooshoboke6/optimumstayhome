"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Calendar, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleFirebaseError, withRetry } from "@/lib/firebase-error-handler"
import { toast } from "@/components/ui/use-toast"

interface BlockedDate {
  id: string
  startDate: Date
  endDate: Date
  reason: string
  createdAt: Date
}

export function BlockedDatesList() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchBlockedDates()
  }, [refreshKey])

  const fetchBlockedDates = async () => {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors

      console.log("Fetching blocked dates from Firestore...")
      const blockedDatesCollection = collection(db, "blockedDates")
      const blockedDatesQuery = query(blockedDatesCollection, orderBy("startDate", "desc"))

      const snapshot = await withRetry(() => getDocs(blockedDatesQuery))

      console.log(`Found ${snapshot.docs.length} blocked date documents`)

      const dates = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          reason: data.reason || "",
          createdAt: new Date(data.createdAt?.toDate?.() || data.createdAt || Date.now()),
        }
      })

      setBlockedDates(dates)
    } catch (err) {
      const errorDetails = handleFirebaseError(err)
      console.error("Error fetching blocked dates:", errorDetails)
      setError(
        `Failed to load blocked dates: ${errorDetails.message}${
          errorDetails.suggestion ? ` ${errorDetails.suggestion}` : ""
        }`,
      )

      toast({
        title: "Failed to Load Blocked Dates",
        description: errorDetails.suggestion || errorDetails.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing",
      description: "Fetching the latest blocked dates...",
    })
    setRefreshKey((prev) => prev + 1)
  }

  const handleUnblock = async (id: string, dateInfo: { start: string; end: string }) => {
    try {
      setDeletingId(id)
      console.log(`Attempting to delete blocked date with ID: ${id}`)

      // Show pending notification
      toast({
        title: "Unblocking Dates",
        description: `Unblocking dates from ${dateInfo.start} to ${dateInfo.end}...`,
      })

      await deleteDoc(doc(db, "blockedDates", id))
      console.log(`Successfully deleted blocked date with ID: ${id}`)

      // Update local state
      setBlockedDates(blockedDates.filter((date) => date.id !== id))

      toast({
        title: "Dates Unblocked",
        description: `Successfully unblocked dates from ${dateInfo.start} to ${dateInfo.end}`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error unblocking dates:", error)
      toast({
        title: "Failed to Unblock Dates",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Currently Blocked Dates</h3>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} aria-label="refresh-blocked-dates">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && blockedDates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No blocked dates found. Use the form above to block dates.
        </div>
      ) : (
        blockedDates.map((blockedDate) => {
          // Format dates for display
          const startFormatted = format(blockedDate.startDate, "MMM d, yyyy")
          const endFormatted = format(blockedDate.endDate, "MMM d, yyyy")

          return (
            <Card key={blockedDate.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#E9A23B] mt-0.5" />
                    <div>
                      <div className="font-medium">
                        {startFormatted} - {endFormatted}
                      </div>
                      {blockedDate.reason && <div className="text-sm text-muted-foreground">{blockedDate.reason}</div>}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unblock these dates?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will make these dates available for booking again. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleUnblock(blockedDate.id, { start: startFormatted, end: endFormatted })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletingId === blockedDate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unblock"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
