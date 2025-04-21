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

    // Verify required credentials exist
    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing required Firebase Admin SDK credentials in environment variables")
      return null
    }

    // Format private key correctly if needed
    if (privateKey && !privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = privateKey.replace(/\\n/g, "\n")
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
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    }

    console.log("Initializing Firebase Admin with service account from env vars:", {
      projectId: serviceAccount.project_id,
      hasPrivateKey: !!serviceAccount.private_key,
      hasClientEmail: !!serviceAccount.client_email,
    })

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

// Export the services
export const auth = app ? admin.auth(app) : null
export const db = app ? admin.firestore(app) : null
export default admin
