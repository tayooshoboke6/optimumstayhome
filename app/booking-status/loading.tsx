import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoadingBookingStatus() {
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
            <CardTitle className="text-3xl">Booking Status</CardTitle>
            <CardDescription>Check the status of your booking at Optimum Stay Homes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-t-[#E9A23B] border-r-[#E9A23B] border-b-[#E9A23B]/40 border-l-[#E9A23B]/40 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-gray-50"></div>
                  </div>
                </div>
                <p className="text-[#E9A23B] font-medium animate-pulse">Loading booking information...</p>
              </div>

              <div className="mt-8 space-y-6">
                <Skeleton className="h-24 w-full rounded-lg" />

                <div>
                  <Skeleton className="h-6 w-40 mb-3" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
