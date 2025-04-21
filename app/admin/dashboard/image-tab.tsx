"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { Loader2, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function ImageTab() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Fetch existing images
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        const imagesDoc = await getDoc(doc(db, "settings", "images"))
        
        if (imagesDoc.exists() && imagesDoc.data().urls) {
          setImages(imagesDoc.data().urls)
        }
      } catch (err) {
        console.error("Error fetching images:", err)
        toast.error("Failed to load images")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return
    
    try {
      setIsAdding(true)
      
      // Add new image URL to the array
      const updatedImages = [...images, newImageUrl]
      
      // Update Firestore
      await setDoc(doc(db, "settings", "images"), { urls: updatedImages })
      
      // Update state
      setImages(updatedImages)
      setNewImageUrl("")
      toast.success("Image added successfully")
    } catch (err) {
      console.error("Error adding image:", err)
      toast.error("Failed to add image")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      // Create a new array without the removed image
      const newImages = images.filter((_, i) => i !== index)
      
      // Update Firestore
      await setDoc(doc(db, "settings", "images"), { urls: newImages })
      
      // Update state
      setImages(newImages)
      toast.success("Image removed successfully")
    } catch (err) {
      console.error("Error removing image:", err)
      toast.error("Failed to remove image")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apartment Images</CardTitle>
        <CardDescription>
          Manage the images displayed in the apartment gallery on the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add image form */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddImage}
              disabled={isAdding || !newImageUrl.trim()}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Image
            </Button>
          </div>

          {/* Images list */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images added yet. Add some image URLs to display in the apartment gallery.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden group">
                  <div className="aspect-video relative bg-gray-100">
                    <Image
                      src={url}
                      alt={`Apartment image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 400px"
                      quality={80}
                    />
                  </div>
                  <div className="p-2 border-t bg-white flex justify-between items-center">
                    <div className="text-sm text-gray-500 truncate flex-1 pr-2">
                      {url}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-4">
            <p className="font-medium">Recommended image specifications:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Width: 1280px or larger (minimum 800px)</li>
              <li>Aspect ratio: 16:9 preferred (landscape orientation)</li>
              <li>Format: JPG or PNG</li>
              <li>Quality: High resolution without being too large in file size</li>
            </ul>
            <p className="mt-2">Images will be displayed centered in a widescreen container while maintaining their original aspect ratio.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 