"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, PlusCircle, MinusCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Amenity {
  id: string
  name: string
  icon: string
}

export function AmenitiesSettings() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const iconOptions = [
    { value: "Wifi", label: "Wi-Fi" },
    { value: "Tv", label: "TV" },
    { value: "Car", label: "Parking" },
    { value: "UtensilsCrossed", label: "Kitchen" },
    { value: "Bath", label: "Bathroom" },
    { value: "Home", label: "Workspace" },
    { value: "Thermometer", label: "Air Conditioning" },
    { value: "Lock", label: "Self Check-in" },
    { value: "Bed", label: "Bed" },
    { value: "Sofa", label: "Living Room" },
    { value: "ShowerHead", label: "Shower" },
    { value: "Refrigerator", label: "Refrigerator" },
    { value: "Coffee", label: "Coffee Machine" },
    { value: "Utensils", label: "Utensils" },
  ]

  useEffect(() => {
    async function fetchAmenities() {
      try {
        setLoading(true)
        const amenitiesDoc = await getDoc(doc(db, "settings", "amenities"))
        
        if (amenitiesDoc.exists()) {
          const data = amenitiesDoc.data()
          setAmenities(data.items || [])
        } else {
          // Set default amenities if none exist
          setAmenities([
            { id: "1", name: "Free Wi-Fi", icon: "Wifi" },
            { id: "2", name: "Smart TV", icon: "Tv" },
            { id: "3", name: "Free Parking", icon: "Car" },
            { id: "4", name: "Fully Equipped Kitchen", icon: "UtensilsCrossed" },
            { id: "5", name: "Luxury Bathroom", icon: "Bath" },
            { id: "6", name: "Workspace", icon: "Home" },
            { id: "7", name: "Air Conditioning", icon: "Thermometer" },
            { id: "8", name: "Self Check-in", icon: "Lock" }
          ])
        }
      } catch (error) {
        console.error("Error fetching amenities:", error)
        toast({
          title: "Error",
          description: "Failed to load amenities",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAmenities()
  }, [])

  const handleAmenityChange = (index: number, field: keyof Amenity, value: string) => {
    const newAmenities = [...amenities]
    newAmenities[index] = {
      ...newAmenities[index],
      [field]: value
    }
    setAmenities(newAmenities)
  }

  const handleAddAmenity = () => {
    const newId = `amenity-${Date.now()}`
    setAmenities([...amenities, { id: newId, name: "", icon: "Home" }])
  }

  const handleRemoveAmenity = (index: number) => {
    const newAmenities = [...amenities]
    newAmenities.splice(index, 1)
    setAmenities(newAmenities)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate that all amenities have names
      const invalidAmenities = amenities.some(a => !a.name.trim())
      if (invalidAmenities) {
        toast({
          title: "Invalid Amenities",
          description: "All amenities must have a name",
          variant: "destructive",
        })
        return
      }

      // Save to Firestore
      await setDoc(doc(db, "settings", "amenities"), {
        items: amenities,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Settings Saved",
        description: "Amenities have been updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error saving amenities:", error)
      toast({
        title: "Error",
        description: "Failed to save amenities",
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
          <CardTitle>Amenities Settings</CardTitle>
          <CardDescription>Edit the amenities that appear on the homepage</CardDescription>
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
        <CardTitle>Amenities Settings</CardTitle>
        <CardDescription>Edit the amenities that appear on the homepage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            {amenities.map((amenity, index) => (
              <div key={amenity.id} className="flex items-center gap-2">
                <Select
                  value={amenity.icon}
                  onValueChange={(value) => handleAmenityChange(index, "icon", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  value={amenity.name}
                  onChange={(e) => handleAmenityChange(index, "name", e.target.value)}
                  placeholder="Amenity name"
                  className="flex-grow"
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveAmenity(index)}
                  disabled={amenities.length <= 1}
                  className="text-red-500"
                >
                  <MinusCircle className="h-5 w-5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleAddAmenity}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Amenity
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#E9A23B] hover:bg-[#d89328] w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Amenities
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 