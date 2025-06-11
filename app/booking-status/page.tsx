"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { Loader2, Calendar, Users, Phone, Mail, CheckCircle, AlertCircle, Search, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidBookingId } from "@/lib/booking-utils"

export default function BookingStatusPage() {
  const searchParams = useSearchParams()
  const initialBookingId = searchParams.get("id") || ""

  const [bookingId, setBookingId] = useState(initialBookingId)
  const [searchBookingId, setSearchBookingId] = useState(initialBookingId)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(!!initialBookingId)
  const [error, setError] = useState<string | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState("2349034569900") // Default fallback number

  useEffect(() => {
    // Fetch the WhatsApp number from settings
    async function fetchWhatsappNumber() {
      try {
        // Check if db is available
        if (!db) {
          console.warn("Firestore not initialized yet, using default WhatsApp number")
          return;
        }
        
        // TypeScript safety: we already checked db is not null above
        const settingsDoc = await getDoc(doc(db!, "settings", "contact"))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          if (data.whatsappNumber) {
            setWhatsappNumber(data.whatsappNumber)
          }
        }
      } catch (err) {
        console.error("Error fetching WhatsApp number:", err)
        // Keep using the default number if there's an error
      }
    }

    fetchWhatsappNumber()

    if (initialBookingId) {
      fetchBooking(initialBookingId)
    }
  }, [initialBookingId])

  async function fetchBooking(id: string) {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      
      // Show immediate feedback that we're processing
      setBooking(null)

      // Validate booking ID format first (client-side validation)
      if (!isValidBookingId(id)) {
        setError("Invalid booking ID format. Please check and try again.")
        setLoading(false)
        return
      }
      
      // Check if db is available
      if (!db) {
        console.warn("Firestore not initialized yet")
        setError("Database connection not ready. Please try again in a moment.")
        setLoading(false)
        return;
      }
      
      // Use a timeout to prevent hanging if Firestore is having issues
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Query timeout")), 10000);
      });

      // Query Firestore for the booking with this ID
      // TypeScript safety: we already checked db is not null above
      const bookingsCollection = collection(db!, "bookings")
      const bookingsQuery = query(bookingsCollection, where("bookingId", "==", id))
      
      // Race between the actual query and the timeout
      const bookingsSnapshot = await Promise.race([
        getDocs(bookingsQuery),
        timeoutPromise
      ]) as any;

      if (bookingsSnapshot.empty) {
        setError("No booking found with this ID. Please check and try again.")
        setBooking(null)
      } else {
        // Get the first matching booking
        const bookingDoc = bookingsSnapshot.docs[0]
        const data = bookingDoc.data()

        setBooking({
          id: bookingDoc.id,
          bookingId: data.bookingId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          guests: data.guests,
          status: data.status,
          specialRequests: data.specialRequests || "",
        })
      }
    } catch (err) {
      console.error("Error fetching booking:", err)
      setError("Failed to load booking details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooking(searchBookingId)
    setBookingId(searchBookingId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="mx-auto w-80 h-24 relative mb-4">
              <Image src="/optimum-stay-logo-removebg-preview.png" alt="Optimum Stay Homes" fill className="object-contain" />
            </div>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Booking Status</CardTitle>
            <CardDescription>Check the status of your booking at Optimum Stay Homes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-id">Enter your Booking ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="booking-id"
                    value={searchBookingId}
                    onChange={(e) => setSearchBookingId(e.target.value.toUpperCase())}
                    placeholder="e.g. OST-ABC123"
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-[#E9A23B] hover:bg-[#d89328]" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-2">Search</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your Booking ID was sent to your email when you made your booking
                </p>
              </div>
            </form>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-t-[#E9A23B] border-r-[#E9A23B] border-b-[#E9A23B]/40 border-l-[#E9A23B]/40 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[#E9A23B] font-medium">
                    {searchBookingId ? `Looking up booking ${searchBookingId}...` : "Loading booking information..."}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {booking && !loading && (
              <div className="mt-8 space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    {booking.status === "confirmed" && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {booking.status === "pending" && <AlertCircle className="h-6 w-6 text-yellow-600" />}
                    {booking.status === "rejected" && <AlertCircle className="h-6 w-6 text-red-600" />}
                  </div>
                  <p className="text-lg font-medium">
                    Booking Status: <span className="font-bold">{booking.status.toUpperCase()}</span>
                  </p>
                  <p className="text-sm mt-1">
                    {booking.status === "pending" &&
                      "Your booking is currently under review. We will confirm it shortly."}
                    {booking.status === "confirmed" &&
                      "Your booking has been confirmed. We look forward to welcoming you!"}
                    {booking.status === "rejected" && "We're sorry, but your booking could not be confirmed."}
                  </p>
                </div>

                {/* WhatsApp Contact Button */}
                <div className="flex justify-center">
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      booking.status === "pending" 
                        ? `Hello, I'm contacting you about my booking ${booking.bookingId}. My name is ${booking.name}. Here is my Valid ID and I'm checking on my pending booking status.`
                        : `Hello, I'm contacting you about my booking ${booking.bookingId}. My name is ${booking.name}.`
                    )}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact us on WhatsApp
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="font-medium">{format(booking.checkIn, "EEEE, MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="font-medium">{format(booking.checkOut, "EEEE, MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Guests</p>
                          <p className="font-medium">{booking.guests}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{booking.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <Phone className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{booking.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9A23B]/10 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5 text-[#E9A23B]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking ID</p>
                          <p className="font-medium">{booking.bookingId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p>{booking.specialRequests}</p>
                    </div>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Check-in Instructions</h3>
                    <div className="space-y-2">
                      <p>
                        Please arrive after 3:00 PM on your check-in date. Our staff will be available to assist you.
                      </p>
                      <p>Please bring a valid ID and the credit card used for booking.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
