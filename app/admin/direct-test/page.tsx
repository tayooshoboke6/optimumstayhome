"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function DirectTestPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("Test block")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [blockedDates, setBlockedDates] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Use absolute URL to fix the invalid URL error
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/admin/block-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        fetchBlockedDates()
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error making request",
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockedDates = async () => {
    setLoadingList(true)
    try {
      // Use absolute URL to fix the invalid URL error
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/admin/block-dates/list`)
      const data = await response.json()

      if (data.success) {
        setBlockedDates(data.dates)
      } else {
        console.error("Error fetching blocked dates:", data)
      }
    } catch (error) {
      console.error("Error fetching blocked dates:", error)
    } finally {
      setLoadingList(false)
    }
  }

  // Fetch blocked dates on initial load
  useState(() => {
    fetchBlockedDates()
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Direct Block Dates Test</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Block Dates Form</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (ISO format)</Label>
              <Input
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g., 2023-12-24T00:00:00.000Z"
                required
              />
              <p className="text-xs text-gray-500">Current date in ISO format: {new Date().toISOString()}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (ISO format)</Label>
              <Input
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="e.g., 2023-12-26T00:00:00.000Z"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for blocking"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                "Block Dates"
              )}
            </Button>
          </form>

          {result && (
            <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <h3 className="font-semibold">{result.success ? "Success" : "Error"}</h3>
              <p>{result.message}</p>
              {result.id && <p className="text-sm mt-1">Document ID: {result.id}</p>}
              {result.error && <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">{result.error}</pre>}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Blocked Dates List</h2>
            <Button variant="outline" size="sm" onClick={fetchBlockedDates} disabled={loadingList}>
              {loadingList ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No blocked dates found.</div>
          ) : (
            <div className="space-y-4">
              {blockedDates.map((date) => (
                <div key={date.id} className="border rounded-lg p-4">
                  <div className="font-semibold">{date.reason || "No reason provided"}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(date.startDate).toLocaleDateString()} - {new Date(date.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">ID: {date.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
