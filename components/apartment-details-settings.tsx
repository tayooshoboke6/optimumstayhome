"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ApartmentDetailsData {
  title: string
  description: string
  locationDescription: string
  details: string[]
}

export function ApartmentDetailsSettings() {
  const [apartmentDetails, setApartmentDetails] = useState<ApartmentDetailsData>({
    title: "Luxury Apartment",
    description: "Welcome to our beautifully designed apartment at Optimum Stay Homes. This spacious and modern accommodation offers the perfect blend of comfort and convenience for your stay.",
    locationDescription: "Located in a prime location, our apartment provides easy access to local attractions, restaurants, and shopping centers. Whether you're visiting for business or pleasure, our apartment offers all the amenities you need for a comfortable and enjoyable stay.",
    details: [
      "1 Bedroom with king-size bed",
      "Fully equipped kitchen",
      "Spacious living area",
      "Modern bathroom with shower",
      "Maximum occupancy: 2 adults"
    ]
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchApartmentDetails() {
      try {
        setLoading(true)
        const apartmentDoc = await getDoc(doc(db, "settings", "apartmentDetails"))
        
        if (apartmentDoc.exists()) {
          const data = apartmentDoc.data() as ApartmentDetailsData
          setApartmentDetails(data)
        }
      } catch (error) {
        console.error("Error fetching apartment details:", error)
        toast({
          title: "Error",
          description: "Failed to load apartment details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApartmentDetails()
  }, [])

  const handleDetailsChange = (index: number, value: string) => {
    const newDetails = [...apartmentDetails.details]
    newDetails[index] = value
    setApartmentDetails({
      ...apartmentDetails,
      details: newDetails
    })
  }

  const handleAddDetail = () => {
    setApartmentDetails({
      ...apartmentDetails,
      details: [...apartmentDetails.details, ""]
    })
  }

  const handleRemoveDetail = (index: number) => {
    const newDetails = [...apartmentDetails.details]
    newDetails.splice(index, 1)
    setApartmentDetails({
      ...apartmentDetails,
      details: newDetails
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate that no required fields are empty
      if (!apartmentDetails.title || !apartmentDetails.description) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Save to Firestore
      await setDoc(doc(db, "settings", "apartmentDetails"), {
        ...apartmentDetails,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Settings Saved",
        description: "Apartment details have been updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error saving apartment details:", error)
      toast({
        title: "Error",
        description: "Failed to save apartment details",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Apartment Details Settings</CardTitle>
          <CardDescription>Edit the apartment details that appear on the homepage</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apartment Details Settings</CardTitle>
        <CardDescription>Edit the apartment details that appear on the homepage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apartment-title">Apartment Title</Label>
            <Input
              id="apartment-title"
              value={apartmentDetails.title}
              onChange={(e) => setApartmentDetails({ ...apartmentDetails, title: e.target.value })}
              placeholder="e.g. Luxury Apartment"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apartment-description">Main Description</Label>
            <Textarea
              id="apartment-description"
              value={apartmentDetails.description}
              onChange={(e) => setApartmentDetails({ ...apartmentDetails, description: e.target.value })}
              placeholder="Describe your apartment..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location-description">Location Description</Label>
            <Textarea
              id="location-description"
              value={apartmentDetails.locationDescription}
              onChange={(e) => setApartmentDetails({ ...apartmentDetails, locationDescription: e.target.value })}
              placeholder="Describe the location..."
              rows={3}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Apartment Details (List Items)</Label>
            {apartmentDetails.details.map((detail, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={detail}
                  onChange={(e) => handleDetailsChange(index, e.target.value)}
                  placeholder={`Detail item ${index + 1}`}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleRemoveDetail(index)}
                  disabled={apartmentDetails.details.length <= 1}
                >
                  <span className="sr-only">Remove</span>
                  ✕
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleAddDetail}
              className="mt-2"
            >
              Add Detail
            </Button>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#E9A23B] hover:bg-[#d89328]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Apartment Details
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 