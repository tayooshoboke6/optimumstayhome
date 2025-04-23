import admin from "firebase-admin"

// Initialize Firebase Admin specifically optimized for Vercel deployment
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
    console.log("Firebase Admin SDK initialization attempt:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
    })

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing required Firebase Admin environment variables")
    }

    // Handle the private key format - comprehensive approach
    if (privateKey) {
      // First, remove any wrapping quotes
      privateKey = privateKey.replace(/^"|"$/g, '')
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, "\n")
      
      // Ensure proper PEM format
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        throw new Error("Private key does not contain BEGIN marker")
      }
      
      if (!privateKey.includes("-----END PRIVATE KEY-----")) {
        throw new Error("Private key does not contain END marker")
      }
      
      // Ensure BEGIN marker has a newline after it
      if (!privateKey.match(/-----BEGIN PRIVATE KEY-----\n/)) {
        privateKey = privateKey.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      }
      
      // Ensure END marker has a newline before it
      if (!privateKey.match(/\n-----END PRIVATE KEY-----/)) {
        privateKey = privateKey.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
      }
    }

    // Initialize the app with detailed error handling
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } catch (initError) {
      console.error("Firebase Admin credential creation error:", initError)
      
      // Try an alternative approach if the first one fails
      try {
        // Create a service account object
        const serviceAccount = {
          type: "service_account",
          project_id: projectId,
          private_key: privateKey,
          client_email: clientEmail,
          // Standard non-sensitive fields
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
          universe_domain: "googleapis.com"
        }
        
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        })
      } catch (alternativeError) {
        console.error("Alternative Firebase Admin initialization failed:", alternativeError)
        throw alternativeError
      }
    }
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

// Export getAuth function for compatibility with existing code
export const getAuth = () => (app ? admin.auth() : null)
export const getFirestore = () => (app ? admin.firestore() : null)
