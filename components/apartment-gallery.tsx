"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Video, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

// Define types for media items
type MediaType = "image" | "video"

interface MediaItem {
  type: MediaType
  src: string
  alt: string
}

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Helper function to get YouTube embed URL
function getYoutubeEmbedUrl(url: string): string {
  const videoId = extractYoutubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
}

// Default fallback images
const defaultMedia: MediaItem[] = [
  {
    type: "image",
    src: "/minimalist-loft.png",
    alt: "Living Room",
  },
  {
    type: "image",
    src: "/opulent-slumber.png",
    alt: "Bedroom",
  },
  {
    type: "image",
    src: "/sleek-minimalist-kitchen.png",
    alt: "Kitchen",
  },
  {
    type: "image",
    src: "/serene-spa-retreat.png",
    alt: "Bathroom",
  },
]

export function ApartmentGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(defaultMedia)
  const [loading, setLoading] = useState(true)

  // Fetch media (images and videos) from Firestore
  useEffect(() => {
    let isMounted = true;
    
    async function fetchMedia() {
      try {
        setLoading(true)
        console.log("Starting to fetch media from Firestore")
        
        // Check if db is available
        if (!db) {
          console.warn("Firestore not initialized yet, using default media")
          setLoading(false)
          return;
        }
        
        // Use a timeout to prevent hanging if Firestore is having issues
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Firestore query timeout")), 5000);
        });
        
        // Fetch images
        let allMedia: MediaItem[] = [];
        
        try {
          // Race between the actual query and the timeout for images
          const imagesDoc = await Promise.race([
            getDoc(doc(db, "settings", "images")),
            timeoutPromise
          ]) as any;
          
          // Process images if they exist
          console.log("Images document exists:", imagesDoc.exists ? "Yes" : "No");
          if (imagesDoc.exists && imagesDoc.exists()) {
            console.log("Images document data:", imagesDoc.data());
          }
          
          if (imagesDoc.exists && imagesDoc.exists() && 
              imagesDoc.data() && imagesDoc.data().urls && 
              imagesDoc.data().urls.length > 0) {
            console.log("Found", imagesDoc.data().urls.length, "images in Firestore");
            // Transform URLs into image objects
            const firebaseImages = imagesDoc.data().urls.map((url: string, index: number): MediaItem => ({
              type: "image",
              src: url,
              alt: `Apartment image ${index + 1}`,
            }));
            
            allMedia = [...allMedia, ...firebaseImages];
          } else {
            console.log("No valid images found in Firestore document");
          }
        } catch (error) {
          console.error("Error fetching images:", error);
        }
        
        // Fetch videos
        try {
          // Race between the actual query and the timeout for videos
          const videosDoc = await Promise.race([
            getDoc(doc(db, "settings", "videos")),
            timeoutPromise
          ]) as any;
          
          // Process videos if they exist
          console.log("Videos document exists:", videosDoc.exists ? "Yes" : "No");
          if (videosDoc.exists && videosDoc.exists()) {
            console.log("Videos document data:", videosDoc.data());
          }
          
          if (videosDoc.exists && videosDoc.exists() && 
              videosDoc.data() && videosDoc.data().urls && 
              videosDoc.data().urls.length > 0) {
            console.log("Found", videosDoc.data().urls.length, "videos in Firestore");
            // Transform URLs into video objects
            const firebaseVideos = videosDoc.data().urls.map((url: string, index: number): MediaItem => ({
              type: "video",
              src: url,
              alt: `Apartment video ${index + 1}`,
            }));
            
            allMedia = [...allMedia, ...firebaseVideos];
          } else {
            console.log("No valid videos found in Firestore document");
          }
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
        
        // Update state with all media if we have any, otherwise use defaults
        if (isMounted) {
          if (allMedia.length > 0) {
            console.log("Found media in Firestore, using", allMedia.length, "items");
            setMediaItems(allMedia);
          } else {
            console.log("No media found in Firestore, using defaults");
          }
        }
      } catch (error) {
        console.error("Error fetching media:", error)
        // Silently fall back to default media on error
        if (isMounted) {
          // Keep using default media on error
          console.log("Using default media due to Firestore error")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMedia()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    }
  }, [])

  const nextSlide = () => {
    setActiveIndex((current) => (current === mediaItems.length - 1 ? 0 : current + 1))
  }

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? mediaItems.length - 1 : current - 1))
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
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.type === "image" ? (
              <Image
                src={
                  item.src
                    ? item.src
                    : `/placeholder.svg?height=500&width=800&query=${encodeURIComponent(item.alt || "apartment interior")}`
                }
                alt={item.alt || "Apartment image"}
                fill
                className="object-contain"
                priority={index === activeIndex}
                sizes="(max-width: 768px) 100vw, 1280px"
                quality={90}
              />
            ) : (
              <iframe
                src={getYoutubeEmbedUrl(item.src)}
                title={item.alt || "Apartment video"}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
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

      <div className="flex gap-2 justify-center items-center">
        {mediaItems.map((item, index) => (
          <button
            key={index}
            className={`flex items-center justify-center ${index === activeIndex ? "text-[#E9A23B]" : "text-gray-300"}`}
            onClick={() => setActiveIndex(index)}
          >
            {item.type === "image" ? (
              <div className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-[#E9A23B]" : "bg-gray-300"}`} />
            ) : (
              <Video className={`h-4 w-4 ${index === activeIndex ? "text-[#E9A23B]" : "text-gray-300"}`} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
