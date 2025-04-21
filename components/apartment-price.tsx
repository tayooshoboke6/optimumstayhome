"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export function ApartmentPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrice() {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "apartment"))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setPrice(data.price || null)
        }
      } catch (error) {
        console.error("Error fetching price:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [])

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-[#E9A23B]" />
  }

  if (price === null) {
    return <span>Price on request</span>
  }

  return (
    <span className="font-bold text-[#E9A23B]">
      ₦{price.toLocaleString()}
      <span className="text-sm font-normal text-gray-600 ml-1">per night</span>
    </span>
  )
}
