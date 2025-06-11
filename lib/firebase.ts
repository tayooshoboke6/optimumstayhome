// This file is for client-side Firebase usage
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getAuth as firebaseAuth } from "firebase/auth"
import { getFirestore as firebaseFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { toast } from "@/components/ui/use-toast"

// Flag to check if we're in a static export build or server-side rendering
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || process.env.NODE_ENV === 'production';
const isServer = typeof window === 'undefined';

// Check for missing environment variables - only in browser and not during initial render
let hasWarnedAboutEnvVars = false;

// Function to check environment variables after a delay to ensure they're loaded
const checkEnvVarsWithDelay = () => {
  if (isServer || hasWarnedAboutEnvVars) return;
  
  // Wait for Next.js to fully hydrate and load env vars
  setTimeout(() => {
    // Skip check if we're using fallback values intentionally
    if (firebaseConfig.apiKey === 'AIzaSyAy-8Z9dmiYmJfilIWM_I0XqNtp7oOcx1w' && 
        firebaseConfig.projectId === 'optimumstayhomes') {
      // We're using the default optimumstayhomes project, no need to warn
      return;
    }
    
    const missingEnvVars = [
      { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
      { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
      { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
      { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
      { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
      { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
    ].filter(env => !env.value);

    if (missingEnvVars.length > 0) {
      console.warn(
        `Missing Firebase environment variables: ${missingEnvVars.map(env => env.key).join(', ')}\n` +
        `Please create a .env.local file with the required variables. See .env.example for reference.`
      );
      hasWarnedAboutEnvVars = true;
    }
  }, 2000); // Increase delay to 2 seconds to ensure Next.js has fully loaded env vars
}

// Only run the check in browser environment
if (!isServer) {
  checkEnvVarsWithDelay();
}

// Use actual values from .env.local or fallback to optimumstayhomes project values
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAy-8Z9dmiYmJfilIWM_I0XqNtp7oOcx1w',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'optimumstayhomes.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'optimumstayhomes',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'optimumstayhomes.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1018994585249',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1018994585249:web:d4038d3790b740670b0ae0',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-SLP8D1XVLL'
}

// Initialize Firebase
function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log("Initializing Firebase...")
      
      // During static export or server-side rendering, use the fallback values
      if ((isStaticExport || isServer) && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.warn(
          "Using fallback Firebase config. " +
          "Client-side Firebase operations will use the optimumstayhomes project configuration."
        )
      }
      
      // Always use the same Firebase app instance
      return initializeApp(firebaseConfig)
    } else {
      // Return existing Firebase app
      return getApps()[0]
    }
  } catch (error) {
    // Handle initialization errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error initializing Firebase:", errorMessage)
    
    // Only show toast in browser environment
    if (typeof window !== 'undefined') {
      toast({
        title: "Firebase Initialization Error",
        description: "There was a problem connecting to the database. Please try refreshing the page.",
        variant: "destructive",
      })
    }
    
    // During static export, we can continue with a dummy app
    if (isStaticExport) {
      console.warn("Continuing with placeholder Firebase config for static export")
      return initializeApp(firebaseConfig)
    }
    
    throw error
  }
}

// Initialize Firebase app
const app = initializeFirebase()

// Initialize Firebase Auth
let auth: ReturnType<typeof firebaseAuth> | null = null;
try {
  auth = firebaseAuth(app);
  if (process.env.NODE_ENV !== 'production') {
    console.log("Firebase Auth initialized successfully");
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error("Error initializing Firebase Auth:", errorMessage);
  
  // Only show toast in browser environment after a delay
  if (!isServer) {
    setTimeout(() => {
      toast({
        title: "Firebase Auth Error",
        description: "Could not initialize Firebase Auth. Check console for details.",
        variant: "destructive",
      })
    }, 1000);
  }
}

// Initialize Firestore
let db: ReturnType<typeof firebaseFirestore> | null = null;
try {
  db = firebaseFirestore(app);
  if (process.env.NODE_ENV !== 'production') {
    console.log("Firebase Firestore initialized successfully");
  }
  
  // Enable offline persistence if in browser environment
  if (!isServer && db) {
    // Note: In Firebase v9+, we can't use synchronizeTabs directly with enableIndexedDbPersistence
    // Instead, we use the default settings which should work for most cases
    enableIndexedDbPersistence(db).catch((err: any) => {
      if (err.code === "failed-precondition") {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn("Firebase persistence could not be enabled: Multiple tabs open. This is normal in development.")
        // Continue without persistence - this is fine for development
      } else if (err.code === "unimplemented") {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firebase persistence not supported in this browser")
      } else {
        console.error("Error enabling Firebase persistence:", err)
      }
    })
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error("Error initializing Firebase Firestore:", errorMessage);
  
  // Only show toast in browser environment after a delay
  if (!isServer) {
    setTimeout(() => {
      toast({
        title: "Firebase Firestore Error",
        description: "Could not initialize Firebase Firestore. Check console for details.",
        variant: "destructive",
      })
    }, 1000);
  }
}

// Export initialized Firebase instances
export { app, auth, db };

// Export wrapper functions for explicit initialization
export function getFirebaseAuth() {
  return auth || firebaseAuth(app);
}

export function getFirebaseFirestore() {
  return db || firebaseFirestore(app);
}
