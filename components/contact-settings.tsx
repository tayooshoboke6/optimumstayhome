"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function ContactSettings() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchContactSettings() {
      try {
        setLoading(true)
        const settingsDoc = await getDoc(doc(db, "settings", "contact"))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setWhatsappNumber(data.whatsappNumber || "")
        }
      } catch (error) {
        console.error("Error fetching contact settings:", error)
        toast({
          title: "Error",
          description: "Failed to load contact settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContactSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // Validate phone number format (basic validation)
      if (whatsappNumber && !/^\d{10,15}$/.test(whatsappNumber.replace(/\D/g, ''))) {
        toast({
          title: "Invalid Format",
          description: "Please enter a valid phone number (10-15 digits)",
          variant: "destructive",
        })
        return
      }

      // Save to Firestore
      await setDoc(doc(db, "settings", "contact"), {
        whatsappNumber,
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      toast({
        title: "Settings Saved",
        description: "Contact settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving contact settings:", error)
      toast({
        title: "Error",
        description: "Failed to save contact settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B]" />
      </div>
    )
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Contact Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp-number">WhatsApp Contact Number</Label>
          <div className="flex gap-2">
            <Input
              id="whatsapp-number"
              placeholder="e.g. 2349034569900"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Include country code without + (e.g., 2349034569900 for Nigeria)
          </p>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="bg-[#E9A23B] hover:bg-[#d89328]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Contact Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 