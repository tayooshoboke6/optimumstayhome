"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export function MinimumNightsDisplay() {
  const [minimumNights, setMinimumNights] = useState<number>(2)
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }

    fetchMinimumNights()
  }, [])

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-[#E9A23B]" />
  }

  return (
    <span>
      {minimumNights} {minimumNights === 1 ? "night" : "nights"}
    </span>
  )
}
