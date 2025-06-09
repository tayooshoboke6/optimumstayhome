// Import the admin SDK
import admin from "firebase-admin"

// Initialize Firebase Admin
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
    // Check for required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing Firebase Admin SDK credentials in environment variables")
      return null
    }

    // Handle the private key format
    if (privateKey) {
      console.log("Processing private key for JSON format, length:", privateKey.length);
      
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
      console.log("Private key processed successfully for JSON format");
    }

    // Create service account from environment variables
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

    console.log("Initializing Firebase Admin from environment variables")

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
    return null
  }
}

// Initialize the app
const app = initializeFirebaseAdmin()

// Export the services directly
export const getAuth = () => (app ? admin.auth(app) : null)
export const getFirestore = () => (app ? admin.firestore(app) : null)
export const firebaseAdmin = admin
