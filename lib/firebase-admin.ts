import admin from "firebase-admin"

// Initialize Firebase Admin only if it hasn't been initialized already
function initializeFirebaseAdmin() {
  // Don't run on client side
  if (typeof window !== "undefined") {
    return null
  }

  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.app()
  }

  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    // Log environment variable presence (not values for security)
    console.log("Firebase Admin SDK initialization:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
    })

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing required Firebase Admin environment variables")
    }

    // Handle the private key format
    if (privateKey && !privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    // Initialize the app
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
    return null
  }
}

// Initialize the app
const app = initializeFirebaseAdmin()

// Export the services
export const auth = app ? admin.auth() : null
export const db = app ? admin.firestore() : null
export default app
