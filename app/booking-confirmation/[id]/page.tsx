"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { Loader2, Calendar, Users, Phone, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true)
        const bookingRef = doc(db, "bookings", params.id)
        const bookingSnap = await getDoc(bookingRef)

        if (bookingSnap.exists()) {
          const data = bookingSnap.data()
          setBooking({
            id: bookingSnap.id,
            bookingId: data.bookingId || "Not Available", // Add the bookingId
            ...data,
            checkIn: new Date(data.checkIn),
            checkOut: new Date(data.checkOut),
          })
        } else {
          setError("Booking not found")
        }
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Error</CardTitle>
            <CardDescription className="text-center">{error || "Booking not found"}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")} className="bg-[#E9A23B] hover:bg-[#d89328]">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="w-64 h-20 relative">
            <Image src="/optimum-stay-logo.png" alt="Optimum Stay Homes" fill className="object-contain" />
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Booking Confirmation</CardTitle>
            <CardDescription>
              Thank you for booking with Optimum Stay Homes. Your booking request has been received.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800">
                  Your booking is currently <span className="font-bold">{booking.status.toUpperCase()}</span>.
                  {booking.status === "pending" && " We will review your request and confirm it shortly."}
                  {booking.status === "confirmed" && " We look forward to welcoming you!"}
                </p>
              </div>

              <div className="bg-[#E9A23B]/10 border border-[#E9A23B]/20 rounded-lg p-4 text-center mt-4">
                <p className="text-sm text-gray-700">Your Booking ID</p>
                <p className="text-xl font-bold">{booking.bookingId}</p>
                <p className="text-xs mt-1">
                  Keep this ID for your records. You can use it to check your booking status anytime.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#E9A23B]" />
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">{format(booking.checkIn, "EEEE, MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#E9A23B]" />
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">{format(booking.checkOut, "EEEE, MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#E9A23B]" />
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-medium">{booking.guests}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Guest Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{booking.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#E9A23B]" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{booking.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-[#E9A23B]" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{booking.phone}</p>
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

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    {booking.status === "pending"
                      ? "We will review your booking request and send you a confirmation email shortly."
                      : "Your booking is confirmed! We've sent you a confirmation email with all the details."}
                  </li>
                  <li>You'll receive check-in instructions and property details before your arrival date.</li>
                  <li>If you have any questions, please contact us at support@optimumstayhomes.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")} className="bg-[#E9A23B] hover:bg-[#d89328]">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
