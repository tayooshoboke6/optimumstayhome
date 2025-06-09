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
      console.log("Processing private key, length:", privateKey.length);
      
      // First, remove any quotes that might be wrapping the key
      privateKey = privateKey.replace(/^"|"$/g, '')
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, "\n")
      
      // Ensure the key has the proper PEM format
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        console.error("Private key missing BEGIN marker");
        throw new Error("Private key does not contain BEGIN marker");
      }
      
      if (!privateKey.includes("-----END PRIVATE KEY-----")) {
        console.error("Private key missing END marker");
        throw new Error("Private key does not contain END marker");
      }
      
      // Ensure BEGIN marker has a newline after it
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----\n")) {
        privateKey = privateKey.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
      }
      
      // Ensure END marker has a newline before it
      if (!privateKey.includes("\n-----END PRIVATE KEY-----")) {
        privateKey = privateKey.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
      }
      
      // Add a final newline if needed
      if (!privateKey.endsWith("\n")) {
        privateKey += "\n";
      }
      
      // Log success but not the actual key
      console.log("Private key processed successfully");
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
