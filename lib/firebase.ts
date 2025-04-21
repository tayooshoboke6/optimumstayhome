// This file is for client-side Firebase usage
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { toast } from "@/components/ui/use-toast"

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log("Initializing Firebase...")
      return initializeApp(firebaseConfig)
    } else {
      return getApps()[0]
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    toast({
      title: "Firebase Initialization Error",
      description: "There was a problem connecting to the database. Please try refreshing the page.",
      variant: "destructive",
    })
    throw error
  }
}

// Initialize services
const app = initializeFirebase()
const auth = getAuth(app)
const db = getFirestore(app)

// Enable offline persistence if in browser environment
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn("Firebase persistence could not be enabled: Multiple tabs open")
    } else if (err.code === "unimplemented") {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firebase persistence not supported in this browser")
    } else {
      console.error("Error enabling Firebase persistence:", err)
    }
  })
}

export { app, auth, db }
