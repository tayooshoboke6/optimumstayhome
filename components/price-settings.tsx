"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePrice } from "@/app/actions/settings-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleFirebaseError, withRetry } from "@/lib/firebase-error-handler"
import { toast } from "@/components/ui/use-toast"

export function PriceSettings() {
  const [price, setPrice] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function fetchPrice() {
      try {
        setLoading(true)
        const settingsDoc = await withRetry(() => getDoc(doc(db, "settings", "apartment")))

        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setPrice(data.price?.toString() || "")
        }
      } catch (error) {
        const errorDetails = handleFirebaseError(error)
        console.error("Error fetching price:", errorDetails)
        setError(`Failed to load price settings: ${errorDetails.message}`)

        toast({
          title: "Failed to Load Price Settings",
          description: errorDetails.suggestion || errorDetails.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [])

  const handleSave = async () => {
    if (!price) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    setError(null)
    setDebugInfo(null)
    setSaving(true)

    try {
      // Show pending notification
      toast({
        title: "Saving Price",
        description: `Setting price to ₦${Number(price).toLocaleString()}...`,
      })

      const result = await updatePrice(Number(price))

      if (result.success) {
        toast({
          title: "Price Updated",
          description: `Price set to ₦${Number(price).toLocaleString()} per night`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setDebugInfo("Price updated successfully")
      } else {
        setError(result.message || "Failed to update price")
        setDebugInfo(`Error: ${JSON.stringify(result)}`)
        toast({
          title: "Price Update Failed",
          description: result.message || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving price:", error)
      setError("An unexpected error occurred. Please try again.")
      setDebugInfo(`Exception: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apartment Price Settings</CardTitle>
        <CardDescription>Set the price for your apartment in Nigerian Naira (₦)</CardDescription>
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
              <Label htmlFor="price">Price per night (₦)</Label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md">₦</span>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-l-none"
                  placeholder="e.g. 25000"
                />
              </div>
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
                  Save Price
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
