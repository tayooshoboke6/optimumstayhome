"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export function AdminStatusChecker() {
  const [status, setStatus] = useState<{
    isLoggedIn?: boolean
    isAdmin?: boolean
    uid?: string
    email?: string
    error?: string
  }>({})
  const [loading, setLoading] = useState(false)

  const checkAdminStatus = async () => {
    setLoading(true)
    try {
      // Use absolute URL to fix any URL parsing issues
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/debug/check-admin`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ error: "Failed to check admin status" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Status Check</CardTitle>
        <CardDescription>Verify if your current user has admin privileges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={checkAdminStatus} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Admin Status"
            )}
          </Button>

          {status.error && (
            <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-600">Error</p>
                <p className="text-sm text-red-700">{status.error}</p>
              </div>
            </div>
          )}

          {status.isLoggedIn !== undefined && !status.error && (
            <div className={`p-3 rounded-md flex items-start gap-2 ${status.isAdmin ? "bg-green-50" : "bg-yellow-50"}`}>
              {status.isAdmin ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {status.isLoggedIn ? "Logged in" : "Not logged in"}
                  {status.isLoggedIn && status.isAdmin && " as Admin"}
                </p>
                {status.email && <p className="text-sm">Email: {status.email}</p>}
                {status.uid && <p className="text-sm">User ID: {status.uid}</p>}
                {status.isLoggedIn && !status.isAdmin && (
                  <p className="text-sm text-yellow-700 mt-1">This user does not have admin privileges</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
