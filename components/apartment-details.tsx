"use client"

import React, { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Wifi, Tv, Car, UtensilsCrossed, Bath, Home, Thermometer, Lock, Bed, Sofa, ShowerHead, Refrigerator, Coffee, Utensils } from "lucide-react"
import { ApartmentPrice } from "@/components/apartment-price"
import { Skeleton } from "@/components/ui/skeleton"

interface ApartmentDetailsData {
  title: string
  description: string
  locationDescription: string
  details: string[]
}

interface Amenity {
  id: string
  name: string
  icon: string
}

interface HouseRule {
  id: string
  rule: string
}

export function ApartmentDetails() {
  const [apartmentDetails, setApartmentDetails] = useState<ApartmentDetailsData | null>(null)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [houseRules, setHouseRules] = useState<HouseRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        
        // Fetch apartment details
        const apartmentDoc = await getDoc(doc(db, "settings", "apartmentDetails"))
        if (apartmentDoc.exists()) {
          setApartmentDetails(apartmentDoc.data() as ApartmentDetailsData)
        } else {
          // Default values if document doesn't exist
          setApartmentDetails({
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
        }

        // Fetch amenities
        const amenitiesDoc = await getDoc(doc(db, "settings", "amenities"))
        if (amenitiesDoc.exists()) {
          setAmenities(amenitiesDoc.data().items || [])
        } else {
          // Default values if document doesn't exist
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

        // Fetch house rules
        const rulesDoc = await getDoc(doc(db, "settings", "houseRules"))
        if (rulesDoc.exists()) {
          setHouseRules(rulesDoc.data().items || [])
        } else {
          // Default values if document doesn't exist
          setHouseRules([
            { id: "1", rule: "No smoking" },
            { id: "2", rule: "No pets" },
            { id: "3", rule: "No parties or events" },
            { id: "4", rule: "Check-in: After 3:00 PM" },
            { id: "5", rule: "Check-out: Before 11:00 AM" }
          ])
        }
      } catch (error) {
        console.error("Error fetching content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Function to render the appropriate icon component
  const renderIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Wifi: <Wifi className="h-5 w-5 text-[#E9A23B]" />,
      Tv: <Tv className="h-5 w-5 text-[#E9A23B]" />,
      Car: <Car className="h-5 w-5 text-[#E9A23B]" />,
      UtensilsCrossed: <UtensilsCrossed className="h-5 w-5 text-[#E9A23B]" />,
      Bath: <Bath className="h-5 w-5 text-[#E9A23B]" />,
      Home: <Home className="h-5 w-5 text-[#E9A23B]" />,
      Thermometer: <Thermometer className="h-5 w-5 text-[#E9A23B]" />,
      Lock: <Lock className="h-5 w-5 text-[#E9A23B]" />,
      Bed: <Bed className="h-5 w-5 text-[#E9A23B]" />,
      Sofa: <Sofa className="h-5 w-5 text-[#E9A23B]" />,
      ShowerHead: <ShowerHead className="h-5 w-5 text-[#E9A23B]" />,
      Refrigerator: <Refrigerator className="h-5 w-5 text-[#E9A23B]" />,
      Coffee: <Coffee className="h-5 w-5 text-[#E9A23B]" />,
      Utensils: <Utensils className="h-5 w-5 text-[#E9A23B]" />
    }
    
    return icons[iconName] || <Home className="h-5 w-5 text-[#E9A23B]" />
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-20 w-full mb-6" />
          
          <div className="mb-6">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
          </div>
        </div>

        <div>
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>

          <div className="mt-8">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">{apartmentDetails?.title || 'Luxury Apartment'}</h3>
        <p className="text-gray-700 mb-6">
          {apartmentDetails?.description}
        </p>
        <p className="text-gray-700 mb-6">
          {apartmentDetails?.locationDescription}
        </p>
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-2">Apartment Details:</h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {apartmentDetails?.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-2">Price:</h4>
          <div className="text-xl">
            <ApartmentPrice />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Amenities</h3>
        <div className="grid grid-cols-2 gap-4">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center gap-2">
              {renderIcon(amenity.icon)}
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="font-semibold text-lg mb-2">House Rules:</h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {houseRules.map((ruleItem) => (
              <li key={ruleItem.id}>{ruleItem.rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
