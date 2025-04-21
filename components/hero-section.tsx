"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center">
      <div className="absolute inset-0 z-0">
        <Image src="/sleek-city-living.png" alt="Apartment interior" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Perfect Stay Awaits</h1>
          <p className="text-xl mb-8">
            Experience luxury and comfort in our beautifully designed apartment. Book your stay today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-[#E9A23B] hover:bg-[#d89328] text-white"
              onClick={() => {
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              className="bg-green-600 text-white hover:bg-green-700 font-medium"
              onClick={() => {
                document.getElementById("apartment")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              View Apartment
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
