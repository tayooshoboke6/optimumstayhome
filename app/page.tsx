import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookingForm } from "@/components/booking-form"
import { ApartmentDetails } from "@/components/apartment-details"
import { ApartmentGallery } from "@/components/apartment-gallery"
import { HeroSection } from "@/components/hero-section"
import { MinimumNightsDisplay } from "@/components/minimum-nights-display"
import { HomepageCalendar } from "@/components/homepage-calendar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="w-80 h-24 relative -ml-4">
              <Image src="/optimum-stay-logo.png" alt="Optimum Stay Homes" fill className="object-contain object-left" />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-900 hover:text-[#E9A23B] font-medium">
              Home
            </Link>
            <Link href="#apartment" className="text-gray-900 hover:text-[#E9A23B] font-medium">
              Apartment
            </Link>
            <Link href="#booking" className="text-gray-900 hover:text-[#E9A23B] font-medium">
              Book Now
            </Link>
            <Link href="/booking-status" className="text-gray-900 hover:text-[#E9A23B] font-medium">
              Check Booking
            </Link>
            
          </nav>
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />

        <section id="apartment" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Apartment</h2>
            <ApartmentGallery />
            <ApartmentDetails />
          </div>
        </section>

        <section id="booking" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-2">Book Your Stay</h2>
              <p className="text-center text-gray-600 mb-8">Experience comfort & convenience at Optimum Stay Homes</p>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg mb-4">Select Your Dates</h3>
                  <HomepageCalendar />
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      • Minimum stay: <MinimumNightsDisplay />
                    </p>
                    <p>• Check-in: After 3:00 PM</p>
                    <p>• Check-out: Before 11:00 AM</p>
                  </div>
                </div>

                <BookingForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-80 h-24 relative">
                <Image src="/optimum-stay-logo-white.png" alt="Optimum Stay Homes" fill className="object-contain" />
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">COMFORT & CONVENIENCE</p>
              <p className="mt-2">© 2025 Optimum Stay Homes. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
