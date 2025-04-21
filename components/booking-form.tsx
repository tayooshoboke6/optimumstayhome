"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { submitBooking } from "@/app/actions/booking-actions"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { useUnavailableDates } from "@/hooks/use-unavailable-dates"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  checkIn: z.date({
    required_error: "Please select a check-in date.",
  }),
  checkOut: z.date({
    required_error: "Please select a check-out date.",
  }),
  guests: z.string().min(1, {
    message: "Please enter the number of guests.",
  }),
  specialRequests: z.string().optional(),
})

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [price, setPrice] = useState<number | null>(null)
  const [nights, setNights] = useState<number>(0)
  const [minimumNights, setMinimumNights] = useState<number>(2)
  const [rangeValidationError, setRangeValidationError] = useState<string | null>(null)

  const [bookingSuccess, setBookingSuccess] = useState<{
    success: boolean
    bookingId?: string
    name?: string
  }>({ success: false })

  // Get unavailable dates
  const {
    unavailableDates,
    isDateUnavailable,
    isRangeAvailable,
    findNextAvailableCheckoutDate,
    loading: loadingDates,
    error: datesError,
  } = useUnavailableDates()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      guests: "1",
      specialRequests: "",
    },
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "apartment"))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setPrice(data.price || null)
          setMinimumNights(data.minimumNights || 2)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    fetchSettings()
  }, [])

  // Update nights calculation and validate date range when dates change
  useEffect(() => {
    const checkIn = form.getValues("checkIn")
    const checkOut = form.getValues("checkOut")

    if (checkIn && checkOut) {
      const diffDays = differenceInDays(checkOut, checkIn)
      setNights(diffDays)

      // Validate the date range
      if (diffDays < minimumNights) {
        setRangeValidationError(`Minimum stay is ${minimumNights} ${minimumNights === 1 ? "night" : "nights"}.`)
      } else if (!isRangeAvailable(checkIn, checkOut)) {
        setRangeValidationError("Your selected date range includes unavailable dates.")
      } else {
        setRangeValidationError(null)
      }
    } else {
      setNights(0)
      setRangeValidationError(null)
    }
  }, [form.watch("checkIn"), form.watch("checkOut"), minimumNights, isRangeAvailable])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if booking meets minimum nights requirement
    if (nights < minimumNights) {
      toast({
        title: "Booking Error",
        description: `Minimum stay is ${minimumNights} ${minimumNights === 1 ? "night" : "nights"}.`,
        variant: "destructive",
      })
      return
    }

    // Check if the date range is valid
    if (!isRangeAvailable(values.checkIn, values.checkOut)) {
      toast({
        title: "Booking Error",
        description: "Your selected date range includes unavailable dates. Please select a different range.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitBooking(values)

      if (result.success) {
        // Set booking success state instead of redirecting
        setBookingSuccess({
          success: true,
          bookingId: result.bookingId,
          name: values.name,
        })

        toast({
          title: "Booking Request Submitted",
          description: "We've received your booking request and will contact you shortly to confirm your reservation.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "There was an error submitting your booking request. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your booking request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle check-in date selection
  const handleCheckInSelect = (date: Date | undefined) => {
    form.setValue("checkIn", date as Date)

    // Clear check-out date if it's before the new check-in date
    const currentCheckOut = form.getValues("checkOut")
    if (date && currentCheckOut && currentCheckOut <= date) {
      form.setValue("checkOut", undefined)
    }

    // If check-in date is selected, try to find the next available check-out date
    if (date) {
      const nextAvailableCheckout = findNextAvailableCheckoutDate(date, minimumNights)
      if (nextAvailableCheckout) {
        form.setValue("checkOut", nextAvailableCheckout)
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {bookingSuccess.success ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Booking Request Successful!</h3>
            <p className="text-gray-600 mb-4">
              Thank you, {bookingSuccess.name}! Your booking request has been submitted successfully. We'll review your
              request and send you a confirmation email shortly.
            </p>
            <div className="bg-[#E9A23B]/10 border border-[#E9A23B]/20 rounded-lg p-4 text-center mt-4 mb-6">
              <p className="text-sm text-gray-700">Your Booking ID</p>
              <p className="text-xl font-bold">{bookingSuccess.bookingId}</p>
              <p className="text-xs mt-1">
                Keep this ID for your records. You can use it to check your booking status anytime.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-[#E9A23B] hover:bg-[#d89328]">
                <Link href={`/booking-status?id=${bookingSuccess.bookingId}`}>View Booking Status</Link>
              </Button>
              <Button variant="outline" onClick={() => setBookingSuccess({ success: false })}>
                Make Another Booking
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold text-lg mb-4">Your Information</h3>

          {loadingDates && (
            <div className="flex items-center justify-center py-4 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B] mr-2" />
              <span>Loading availability data...</span>
            </div>
          )}

          {datesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{datesError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={loadingDates}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleCheckInSelect}
                            disabled={(date) => {
                              // Disable dates in the past
                              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                              // Disable unavailable dates
                              const isUnavailable = isDateUnavailable(date)
                              return isPast || isUnavailable
                            }}
                            modifiers={{
                              unavailable: unavailableDates,
                            }}
                            modifiersStyles={{
                              unavailable: {
                                textDecoration: "line-through",
                                backgroundColor: "rgb(254 226 226)", // Light red background
                                color: "rgb(185 28 28)", // Dark red text
                              },
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={!form.getValues("checkIn") || loadingDates}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)

                              // Validate the range when checkout date is selected
                              const checkIn = form.getValues("checkIn")
                              if (checkIn && date) {
                                if (!isRangeAvailable(checkIn, date)) {
                                  toast({
                                    title: "Warning",
                                    description: "Your selected date range includes unavailable dates.",
                                    variant: "destructive",
                                  })
                                }
                              }
                            }}
                            disabled={(date) => {
                              const checkIn = form.getValues("checkIn")
                              // Disable dates before check-in
                              const isBeforeCheckIn = checkIn && date <= checkIn
                              // Disable unavailable dates
                              const isUnavailable = isDateUnavailable(date)
                              return isBeforeCheckIn || isUnavailable
                            }}
                            modifiers={{
                              unavailable: unavailableDates,
                            }}
                            modifiersStyles={{
                              unavailable: {
                                textDecoration: "line-through",
                                backgroundColor: "rgb(254 226 226)", // Light red background
                                color: "rgb(185 28 28)", // Dark red text
                              },
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date range validation error */}
              {rangeValidationError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{rangeValidationError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum 2 guests allowed. Minimum stay: {minimumNights} {minimumNights === 1 ? "night" : "nights"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or requirements?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price calculation */}
              {price !== null && nights > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>
                      ₦{price.toLocaleString()} × {nights} nights
                    </span>
                    <span>₦{(price * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-[#E9A23B]">₦{(price * nights).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#E9A23B] hover:bg-[#d89328]"
                disabled={isSubmitting || loadingDates || !!rangeValidationError}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="relative mr-2">
                      <div className="h-4 w-4 rounded-full border-2 border-t-white border-r-white border-b-white/40 border-l-white/40 animate-spin"></div>
                    </div>
                    <span>Processing</span>
                  </div>
                ) : (
                  "Submit Booking Request"
                )}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  )
}
