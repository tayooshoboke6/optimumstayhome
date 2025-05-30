// Use the 'server-only' package to ensure this code only runs on the server
import "server-only"

// Import the admin SDK
import admin from "firebase-admin"

// Import the config
import { getFirebaseAdminConfig } from "./firebase-admin-config"

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.app()
  }

  const config = getFirebaseAdminConfig()

  if (!config) {
    console.error("Firebase Admin config is not available")
    return null
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(config.credential),
    })
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
    return null
  }
}

// Initialize the app
const app = initializeFirebaseAdmin()

// Export the services
export const getAuth = () => (app ? admin.auth(app) : null)
export const getFirestore = () => (app ? admin.firestore(app) : null)
