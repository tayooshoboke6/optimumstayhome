import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin/app";

// Initialize Firebase Admin with robust private key handling
function initializeFirebaseAdmin() {
  // Don't run on client side
  if (typeof window !== "undefined") {
    return null;
  }

  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Log environment variable presence (not values for security)
    console.log("Firebase Admin SDK initialization attempt:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
    });

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing required Firebase Admin environment variables");
    }

    // Create a complete service account object
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      // Handle the private key with multiple approaches
      privateKey: processPrivateKey(privateKey),
    };

    // Initialize the app
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
}

// Process private key with multiple approaches to ensure it works
function processPrivateKey(key: string): string {
  if (!key) return "";
  
  console.log("Processing private key, length:", key.length);
  
  try {
    // 1. First, remove any quotes that might be wrapping the key
    key = key.replace(/^"|"$/g, '');
    
    // 2. Replace escaped newlines with actual newlines
    key = key.replace(/\\n/g, "\n");
    
    // 3. Log key format information for debugging
    console.log("Key format check:", {
      hasBeginMarker: key.includes("-----BEGIN PRIVATE KEY-----"),
      hasEndMarker: key.includes("-----END PRIVATE KEY-----"),
      startsWithBeginMarker: key.startsWith("-----BEGIN PRIVATE KEY-----"),
      endsWithEndMarker: key.endsWith("-----END PRIVATE KEY-----") || key.endsWith("-----END PRIVATE KEY-----\n"),
    });
    
    // 4. If key doesn't have markers, it might be base64 only, so add them
    if (!key.includes("-----BEGIN PRIVATE KEY-----") && !key.includes("-----END PRIVATE KEY-----")) {
      console.log("Adding PEM markers to key");
      key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
    }
    
    // 5. Ensure proper spacing around BEGIN marker
    if (key.includes("-----BEGIN PRIVATE KEY-----") && !key.includes("-----BEGIN PRIVATE KEY-----\n")) {
      key = key.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
    }
    
    // 6. Ensure proper spacing around END marker
    if (key.includes("-----END PRIVATE KEY-----") && !key.includes("\n-----END PRIVATE KEY-----")) {
      key = key.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
    }
    
    // 7. Add final newline if needed
    if (!key.endsWith("\n")) {
      key += "\n";
    }
    
    console.log("Private key processed successfully");
    return key;
  } catch (err) {
    console.error("Error processing private key:", err);
    throw new Error("Failed to process Firebase private key");
  }
}

// Initialize the app
const app = initializeFirebaseAdmin();

// Export the services
export const auth = app ? admin.auth() : null;
export const db = app ? admin.firestore() : null;
export default app;

// Export getAuth function for compatibility with existing code
export const getAuth = () => (app ? admin.auth() : null);
export const getFirestore = () => (app ? admin.firestore() : null);
