// Import the admin SDK
import originalAdmin from "firebase-admin"

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  // Don't run on client side
  if (typeof window !== "undefined") {
    return null
  }

  // Check if already initialized
  if (originalAdmin.apps.length > 0) {
    return originalAdmin.app()
  }

  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    // Log environment variable presence (not values for security)
    console.log("Firebase Admin SDK initialization:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyStartsWith: privateKey ? privateKey.substring(0, 20) + "..." : "undefined",
    })

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing required Firebase Admin environment variables")
    }

    // Initialize the app with direct credential object
    return originalAdmin.initializeApp({
      credential: {
        projectId,
        clientEmail,
        privateKey,
      } as originalAdmin.credential.Credential,
    })
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
    return null
  }
}

// Initialize the app
const app = initializeFirebaseAdmin()

// Export the services
export const auth = app ? originalAdmin.auth(app) : null
export const db = app ? originalAdmin.firestore(app) : null
export { originalAdmin as admin }
