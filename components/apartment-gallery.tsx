"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

// Default fallback images
const defaultImages = [
  {
    src: "/minimalist-loft.png",
    alt: "Living Room",
  },
  {
    src: "/opulent-slumber.png",
    alt: "Bedroom",
  },
  {
    src: "/sleek-minimalist-kitchen.png",
    alt: "Kitchen",
  },
  {
    src: "/serene-spa-retreat.png",
    alt: "Bathroom",
  },
]

export function ApartmentGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [images, setImages] = useState(defaultImages)
  const [loading, setLoading] = useState(true)

  // Fetch images from Firestore
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        const imagesDoc = await getDoc(doc(db, "settings", "images"))
        
        if (imagesDoc.exists() && imagesDoc.data().urls && imagesDoc.data().urls.length > 0) {
          // Transform URLs into image objects
          const firebaseImages = imagesDoc.data().urls.map((url: string, index: number) => ({
            src: url,
            alt: `Apartment image ${index + 1}`,
          }))
          
          setImages(firebaseImages)
        }
      } catch (err) {
        console.error("Error fetching images:", err)
        // Keep the default images on error
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const nextSlide = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  if (loading) {
    return (
      <div className="mb-12 flex justify-center items-center h-[300px] md:h-[500px] bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
      </div>
    )
  }

  return (
    <div className="mb-12">
      <div className="relative rounded-xl overflow-hidden w-full max-w-5xl mx-auto aspect-[16/9] bg-gray-100 mb-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={
                image.src
                  ? image.src
                  : `/placeholder.svg?height=500&width=800&query=${encodeURIComponent(image.alt || "apartment interior")}`
              }
              alt={image.alt || "Apartment image"}
              fill
              className="object-contain"
              priority={index === activeIndex}
              sizes="(max-width: 768px) 100vw, 1280px"
              quality={90}
            />
          </div>
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex gap-2 justify-center">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-[#E9A23B]" : "bg-gray-300"}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
