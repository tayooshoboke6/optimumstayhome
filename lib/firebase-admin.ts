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
    if (privateKey) {
      // First, remove any quotes that might be wrapping the key
      privateKey = privateKey.replace(/^"|"$/g, '')
      
      // Then ensure newlines are properly formatted
      // This handles both escaped newlines and actual newlines
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        privateKey = privateKey.replace(/\\n/g, "\n")
      }
      
      // Ensure the key has proper PEM format with actual newlines
      if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----\n")) {
        privateKey = privateKey.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      }
      
      if (!privateKey.endsWith("\n-----END PRIVATE KEY-----") && !privateKey.endsWith("\n-----END PRIVATE KEY-----\n")) {
        privateKey = privateKey.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
      }
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
