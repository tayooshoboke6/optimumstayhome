"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { Calendar, Home, LogOut, Settings, User, Check, X, MoreHorizontal, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { signOut, useAuth } from "@/lib/auth"
import { updateBookedDatesForBooking } from "@/lib/booking-utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Import the CalendarTab component
import { CalendarTab } from "./calendar-tab"

// Add the import for PriceSettings at the top with other imports
import { PriceSettings } from "@/components/price-settings"
import { MinimumNightsSettings } from "@/components/minimum-nights-settings"
import { ContactSettings } from "@/components/contact-settings"
// Add the import at the top with other imports
import { AdminStatusChecker } from "@/components/admin-status-checker"

// Add these imports at the top of the file with other imports
import { notifyBookingAction } from "@/lib/notifications"

// Import the ContentTab component with other imports
import { ContentTab } from "./content-tab"

// Import the ImageTab component with other imports
import { ImageTab } from "./image-tab"

// Import the VideoTab component with other imports
import { VideoTab } from "./video-tab"

// Define the Booking type
interface Booking {
  id: string
  name: string
  email: string
  phone: string
  checkIn: Date
  checkOut: Date
  guests: number | string
  status: string
  specialRequests?: string
  createdAt: Date
  bookingId?: string
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [apartmentPrice, setApartmentPrice] = useState<number>(0)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("bookings")

  // Helper function to calculate number of nights
  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Helper function to calculate booking amount
  const calculateBookingAmount = (booking: Booking): number => {
    const nights = calculateNights(booking.checkIn, booking.checkOut);
    return apartmentPrice * nights;
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin")
    }
  }, [user, authLoading, router])

  // Fetch bookings from Firestore
  useEffect(() => {
    async function fetchBookings() {
      if (!user) return

      try {
        setLoading(true)
        const bookingsCollection = collection(db, "bookings")
        const bookingsQuery = query(bookingsCollection, orderBy("createdAt", "desc"))
        const bookingsSnapshot = await getDocs(bookingsQuery)

        const bookingsData = bookingsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            // Convert ISO strings to Date objects
            checkIn: new Date(data.checkIn),
            checkOut: new Date(data.checkOut),
            guests: data.guests,
            status: data.status,
            specialRequests: data.specialRequests,
            // Convert Firestore timestamp to Date
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            bookingId: data.bookingId,
          } as Booking
        })

        setBookings(bookingsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings. Please check your Firebase connection and permissions.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  // Fetch apartment price from Firestore
  useEffect(() => {
    async function fetchPrice() {
      try {
        setLoadingPrice(true)
        const settingsDoc = await getDoc(doc(db, "settings", "apartment"))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setApartmentPrice(data.price || 0)
        }
      } catch (err) {
        console.error("Error fetching apartment price:", err)
      } finally {
        setLoadingPrice(false)
      }
    }

    fetchPrice()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push("/admin")
  }

  // Then find the confirmBooking function and update it:
  const confirmBooking = async (id: string) => {
    try {
      setProcessingId(id)

      // Show pending notification
      notifyBookingAction("Confirmation", "pending", "Processing booking confirmation...")

      // Find the booking data
      const booking = bookings.find(b => b.id === id);
      
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Update status in Firestore
      const bookingRef = doc(db, "bookings", id)
      await updateDoc(bookingRef, { status: "confirmed" })

      // Add to bookedDates collection
      await updateBookedDatesForBooking(
        booking.bookingId || id, 
        booking.checkIn, 
        booking.checkOut, 
        true
      );

      // Update local state
      setBookings(bookings.map((booking) => (booking.id === id ? { ...booking, status: "confirmed" } : booking)))

      notifyBookingAction("Confirmation", "success", "The booking has been confirmed successfully.")
    } catch (error) {
      console.error("Error confirming booking:", error)
      notifyBookingAction("Confirmation", "error", "There was an error confirming the booking.")
    } finally {
      setProcessingId(null)
    }
  }

  // Then find the rejectBooking function and update it:
  const rejectBooking = async (id: string) => {
    try {
      setProcessingId(id)

      // Show pending notification
      notifyBookingAction("Rejection", "pending", "Processing booking rejection...")

      // Find the booking data
      const booking = bookings.find(b => b.id === id);
      
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Update status in Firestore
      const bookingRef = doc(db, "bookings", id)
      await updateDoc(bookingRef, { status: "rejected" })

      // Remove from bookedDates collection if it was previously confirmed
      if (booking.status === "confirmed") {
        await updateBookedDatesForBooking(
          booking.bookingId || id, 
          booking.checkIn, 
          booking.checkOut, 
          false
        );
      }

      // Update local state
      setBookings(bookings.map((booking) => (booking.id === id ? { ...booking, status: "rejected" } : booking)))

      notifyBookingAction("Rejection", "success", "The booking has been rejected.")
    } catch (error) {
      console.error("Error rejecting booking:", error)
      notifyBookingAction("Rejection", "error", "There was an error rejecting the booking.")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed")
  const rejectedBookings = bookings.filter((booking) => booking.status === "rejected")

  // Calculate total revenue from confirmed bookings
  const calculateTotalRevenue = () => {
    if (confirmedBookings.length === 0) return 0
    
    return confirmedBookings.reduce((total, booking) => {
      // Add the revenue for this booking to the total
      return total + calculateBookingAmount(booking);
    }, 0)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-80 h-24 relative">
                <Image src="/optimum-stay-logo-removebg-preview.png" alt="Optimum Stay Homes" fill className="object-contain" />
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`flex w-full items-center gap-2 p-2 rounded-md ${
                    activeTab === "bookings" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex w-full items-center gap-2 p-2 rounded-md ${
                    activeTab === "calendar" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  Calendar
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("guests")}
                  className={`flex w-full items-center gap-2 p-2 rounded-md ${
                    activeTab === "guests" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5" />
                  Guests
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex w-full items-center gap-2 p-2 rounded-md ${
                    activeTab === "settings" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-gray-700" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <header className="bg-white border-b p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="md:hidden">
                  Menu
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {pendingBookings.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingBookings.length}</div>
                  <p className="text-xs text-muted-foreground">Bookings awaiting confirmation</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {confirmedBookings.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{confirmedBookings.length}</div>
                  <p className="text-xs text-muted-foreground">Upcoming confirmed stays</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {loadingPrice ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-[#E9A23B] mr-2" />
                      <span className="text-sm">Calculating...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold flex items-center">
                        <span className="mr-1">₦</span>
                        {calculateTotalRevenue().toLocaleString("en-NG")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {confirmedBookings.length > 0 
                          ? `Based on ${confirmedBookings.length} confirmed ${confirmedBookings.length === 1 ? 'booking' : 'bookings'}`
                          : "No revenue data available yet"}
                      </p>
                      {confirmedBookings.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current price: ₦{apartmentPrice.toLocaleString("en-NG")}/night
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="guests">Guests</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Requests</CardTitle>
                    <CardDescription>Manage your booking requests and reservations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">No bookings found</div>
                        ) : (
                          bookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4">
                              {booking.bookingId && (
                                <div className="mb-2 flex justify-between items-center">
                                  <div className="text-sm font-medium bg-[#E9A23B]/10 text-[#E9A23B] border border-[#E9A23B]/20 px-3 py-1 rounded-md inline-flex items-center">
                                    <span className="font-bold mr-1">Booking ID:</span> {booking.bookingId}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {format(booking.createdAt, "MMM d, yyyy")}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-semibold">{booking.name}</div>
                                  <div className="text-sm text-muted-foreground">{booking.email}</div>
                                </div>
                                <div className="flex items-center">
                                  {booking.status === "pending" && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                                  )}
                                  {booking.status === "confirmed" && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
                                  )}
                                  {booking.status === "rejected" && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            View Details
                                          </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Booking Details</DialogTitle>
                                            <div className="text-sm text-muted-foreground mt-2">
                                              {booking.bookingId ? (
                                                <div className="text-center">
                                                  <div className="text-sm font-medium bg-[#E9A23B]/10 text-[#E9A23B] border border-[#E9A23B]/20 px-3 py-2 rounded-md inline-flex items-center">
                                                    <span className="font-bold mr-1">Booking ID:</span> {booking.bookingId}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="text-gray-500">No booking ID available</span>
                                              )}
                                            </div>
                                          </DialogHeader>
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Guest Name:</div>
                                              <div>{booking.name}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Email:</div>
                                              <div>{booking.email}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Phone:</div>
                                              <div>{booking.phone}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Check-in:</div>
                                              <div>{format(booking.checkIn, "PPP")}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Check-out:</div>
                                              <div>{format(booking.checkOut, "PPP")}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Guests:</div>
                                              <div>{booking.guests}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Status:</div>
                                              <div>
                                                {booking.status === "pending" && (
                                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    Pending
                                                  </Badge>
                                                )}
                                                {booking.status === "confirmed" && (
                                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    Confirmed
                                                  </Badge>
                                                )}
                                                {booking.status === "rejected" && (
                                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                                    Rejected
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Duration:</div>
                                              <div>
                                                {calculateNights(booking.checkIn, booking.checkOut)} nights
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Amount:</div>
                                              <div className="font-semibold text-[#E9A23B]">
                                                ₦{calculateBookingAmount(booking).toLocaleString("en-NG")}
                                                <span className="text-xs text-gray-500 ml-1">(at current rate)</span>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="text-sm font-medium">Price Breakdown:</div>
                                              <div className="text-sm">
                                                <span className="text-[#E9A23B] font-medium">₦{apartmentPrice.toLocaleString("en-NG")}</span> × {calculateNights(booking.checkIn, booking.checkOut)} nights = <span className="text-[#E9A23B] font-semibold">₦{calculateBookingAmount(booking).toLocaleString("en-NG")}</span>
                                              </div>
                                            </div>
                                            {booking.specialRequests && (
                                              <div className="grid grid-cols-1 gap-2">
                                                <div className="text-sm font-medium">Special Requests:</div>
                                                <div className="bg-gray-50 p-2 rounded text-sm">
                                                  {booking.specialRequests}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <DialogFooter>
                                            {booking.status === "pending" && (
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="outline"
                                                  onClick={() => rejectBooking(booking.id)}
                                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                                  disabled={processingId === booking.id}
                                                >
                                                  {processingId === booking.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                  ) : (
                                                    <X className="h-4 w-4 mr-2" />
                                                  )}
                                                  Reject
                                                </Button>
                                                <Button
                                                  onClick={() => confirmBooking(booking.id)}
                                                  className="bg-[#E9A23B] hover:bg-[#d89328]"
                                                  disabled={processingId === booking.id}
                                                >
                                                  {processingId === booking.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                  ) : (
                                                    <Check className="h-4 w-4 mr-2" />
                                                  )}
                                                  Confirm
                                                </Button>
                                              </div>
                                            )}
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                      {booking.status === "pending" && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => confirmBooking(booking.id)}
                                            disabled={processingId === booking.id}
                                          >
                                            Confirm Booking
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => rejectBooking(booking.id)}
                                            disabled={processingId === booking.id}
                                          >
                                            Reject Booking
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Check-in</div>
                                  <div>{format(booking.checkIn, "MMM d, yyyy")}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Check-out</div>
                                  <div>{format(booking.checkOut, "MMM d, yyyy")}</div>
                                </div>
                              </div>
                              
                              {/* Booking Amount */}
                              <div className="mt-2 p-2 bg-[#E9A23B]/5 rounded-md flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="text-gray-600">{calculateNights(booking.checkIn, booking.checkOut)} nights</span>
                                </div>
                                <div className="font-medium text-[#E9A23B]">
                                  ₦{calculateBookingAmount(booking).toLocaleString("en-NG")}
                                </div>
                              </div>
                              
                              {booking.status === "pending" && (
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rejectBooking(booking.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    disabled={processingId === booking.id}
                                  >
                                    {processingId === booking.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4 mr-2" />
                                    )}
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => confirmBooking(booking.id)}
                                    className="bg-[#E9A23B] hover:bg-[#d89328]"
                                    disabled={processingId === booking.id}
                                  >
                                    {processingId === booking.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-2" />
                                    )}
                                    Confirm
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="calendar">
                <CalendarTab bookings={bookings} loading={loading} error={error} />
              </TabsContent>
              <TabsContent value="guests">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Management</CardTitle>
                    <CardDescription>View and manage guest information.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Guest management features coming soon</div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure your apartment booking system.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <AdminStatusChecker />
                      <PriceSettings />
                      <MinimumNightsSettings />
                      <ContactSettings />
                      <ContentTab />
                      <ImageTab />
                      <VideoTab />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
