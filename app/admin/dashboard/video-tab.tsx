"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, X, Plus, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url: string): string | null {
  // Handle YouTube Shorts URLs
  if (url.includes('youtube.com/shorts/')) {
    const shortsRegExp = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:[\/?#]|$)/
    const shortsMatch = url.match(shortsRegExp)
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1]
  }
  
  // Handle standard YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Helper function to validate YouTube URL
function isValidYoutubeUrl(url: string): boolean {
  return !!extractYoutubeVideoId(url)
}

export function VideoTab() {
  const [videos, setVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch existing videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        if (!db) {
          throw new Error("Firestore database is not available")
        }
        const videosDoc = await getDoc(doc(db, "settings", "videos"))
        
        if (videosDoc.exists() && videosDoc.data().urls) {
          setVideos(videosDoc.data().urls)
        }
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError("Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      setError("Please enter a YouTube video URL")
      return
    }
    
    if (!isValidYoutubeUrl(newVideoUrl)) {
      setError("Please enter a valid YouTube video URL")
      return
    }
    
    setError(null)
    setSuccess(null)
    
    try {
      setIsAdding(true)
      
      if (!db) {
        throw new Error("Firestore database is not available")
      }
      
      // Add new video URL to the array
      const updatedVideos = [...videos, newVideoUrl]
      
      // Update Firestore
      await setDoc(doc(db, "settings", "videos"), { urls: updatedVideos })
      
      // Update state
      setVideos(updatedVideos)
      setNewVideoUrl("")
      setSuccess("Video added successfully")
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (err) {
      console.error("Error adding video:", err)
      setError("Failed to add video")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveVideo = async (index: number) => {
    setError(null)
    setSuccess(null)
    
    try {
      if (!db) {
        throw new Error("Firestore database is not available")
      }
      
      // Create a new array without the removed video
      const newVideos = videos.filter((_, i) => i !== index)
      
      // Update Firestore
      await setDoc(doc(db, "settings", "videos"), { urls: newVideos })
      
      // Update state
      setVideos(newVideos)
      setSuccess("Video removed successfully")
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (err) {
      console.error("Error removing video:", err)
      setError("Failed to remove video")
    }
  }

  // Get YouTube thumbnail from video URL
  const getYoutubeThumbnail = (url: string): string => {
    const videoId = extractYoutubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : ""
  }

  // Get embedded YouTube URL
  const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = extractYoutubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apartment Videos</CardTitle>
        <CardDescription>
          Add YouTube videos to showcase your apartment. These videos will be displayed in the gallery on the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Error and success messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {/* Add video form */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter YouTube video URL (https://youtube.com/...)"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddVideo}
              disabled={isAdding || !newVideoUrl.trim()}
              className="bg-[#E9A23B] hover:bg-[#d89328]"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </>
              )}
            </Button>
          </div>

          {/* Videos list */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#E9A23B]" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No videos added yet. Add YouTube video URLs to display in the apartment gallery.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((url, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden group">
                  <div className="aspect-video relative bg-gray-100">
                    <iframe
                      src={getYoutubeEmbedUrl(url)}
                      title={`Apartment video ${index + 1}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-2 border-t bg-white flex justify-between items-center">
                    <div className="text-sm text-gray-500 truncate flex-1 pr-2">
                      {url}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleRemoveVideo(index)}
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
            <p className="font-medium">Tips for adding videos:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Use YouTube video URLs (e.g., https://www.youtube.com/watch?v=VIDEOID)</li>
              <li>Short, high-quality videos work best for showcasing your apartment</li>
              <li>Videos will be displayed alongside images in the gallery</li>
              <li>Ensure videos are appropriate and relevant to your property</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
