"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateMinimumNights } from "@/app/actions/settings-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleFirebaseError, withRetry } from "@/lib/firebase-error-handler"
import { toast } from "@/components/ui/use-toast"

export function MinimumNightsSettings() {
  const [minimumNights, setMinimumNights] = useState<string>("2")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function fetchMinimumNights() {
      try {
        setLoading(true)
        const settingsDoc = await withRetry(() => getDoc(doc(db, "settings", "apartment")))

        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setMinimumNights(data.minimumNights?.toString() || "2")
        }
      } catch (error) {
        const errorDetails = handleFirebaseError(error)
        console.error("Error fetching minimum nights:", errorDetails)
        setError(`Failed to load minimum nights settings: ${errorDetails.message}`)

        toast({
          title: "Failed to Load Minimum Nights Settings",
          description: errorDetails.suggestion || errorDetails.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMinimumNights()
  }, [])

  const handleSave = async () => {
    if (!minimumNights) {
      toast({
        title: "Error",
        description: "Please select a valid minimum nights value",
        variant: "destructive",
      })
      return
    }

    setError(null)
    setDebugInfo(null)
    setSaving(true)

    // Format for display in notifications
    const nightsText = minimumNights === "1" ? "night" : "nights"

    try {
      // Show pending notification
      toast({
        title: "Saving Minimum Stay",
        description: `Setting minimum stay to ${minimumNights} ${nightsText}...`,
      })

      const result = await updateMinimumNights(Number(minimumNights))

      if (result.success) {
        toast({
          title: "Minimum Stay Updated",
          description: `Minimum stay set to ${minimumNights} ${nightsText}`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setDebugInfo("Minimum nights updated successfully")
      } else {
        setError(result.message || "Failed to update minimum nights")
        setDebugInfo(`Error: ${JSON.stringify(result)}`)
        toast({
          title: "Minimum Stay Update Failed",
          description: result.message || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving minimum nights:", error)
      setError("An unexpected error occurred. Please try again.")
      setDebugInfo(`Exception: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to update minimum nights",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minimum Stay Settings</CardTitle>
        <CardDescription>Set the minimum number of nights required for booking</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B]" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="minimumNights">Minimum Nights</Label>
              <Select value={minimumNights} onValueChange={setMinimumNights}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select minimum nights" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Night</SelectItem>
                  <SelectItem value="2">2 Nights</SelectItem>
                  <SelectItem value="3">3 Nights</SelectItem>
                  <SelectItem value="4">4 Nights</SelectItem>
                  <SelectItem value="5">5 Nights</SelectItem>
                  <SelectItem value="6">6 Nights</SelectItem>
                  <SelectItem value="7">7 Nights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-[#E9A23B] hover:bg-[#d89328]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Setting
                </>
              )}
            </Button>

            {debugInfo && showDebug && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto">
                <p>Debug Info:</p>
                <pre>{debugInfo}</pre>
              </div>
            )}

            {debugInfo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-500"
              >
                {showDebug ? "Hide Debug Info" : "Show Debug Info"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
