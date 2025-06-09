import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Ultimate Firebase Admin SDK initialization with comprehensive private key handling
// This version handles all possible private key formats and provides detailed logging

// Check if Firebase Admin is already initialized
const apps = getApps();
let firebaseAdmin: admin.app.App | undefined;

// Initialize the Firebase Admin SDK if it hasn't been initialized yet
if (!apps.length) {
  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Log environment variable presence (not values for security)
    console.log("Initializing Firebase Admin SDK...");
    console.log("Firebase Admin SDK initialization:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
    });

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing required Firebase Admin environment variables");
    }

    // Process the private key to ensure it's in the correct format
    privateKey = processPrivateKey(privateKey);

    // Initialize the app
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Don't throw here, let the app continue and handle the error when services are used
  }
} else {
  firebaseAdmin = admin.app();
}

// Process private key with multiple approaches to ensure it works
function processPrivateKey(key: string): string {
  if (!key) {
    throw new Error("Private key is empty");
  }
  
  console.log("Processing private key, length:", key.length);
  
  try {
    // 1. First, remove any quotes that might be wrapping the key
    key = key.replace(/^"|"$/g, '');
    
    // 2. Replace escaped newlines with actual newlines
    key = key.replace(/\\n/g, "\n");
    
    // 3. Log key format information for debugging
    const hasBeginMarker = key.includes("-----BEGIN PRIVATE KEY-----");
    const hasEndMarker = key.includes("-----END PRIVATE KEY-----");
    
    console.log("Key format check:", {
      hasBeginMarker,
      hasEndMarker,
      startsWithBeginMarker: key.startsWith("-----BEGIN PRIVATE KEY-----"),
      endsWithEndMarker: key.endsWith("-----END PRIVATE KEY-----") || key.endsWith("-----END PRIVATE KEY-----\n"),
    });
    
    // Check if key might be in JSON format (from service account JSON)
    if (key.includes('"private_key":')) {
      console.log("Private key missing END marker");
      console.log("Processing private key for JSON format, length:", key.length);
      try {
        // Try to parse as JSON
        const jsonKey = JSON.parse(key);
        if (jsonKey.private_key) {
          console.log("Successfully extracted private_key from JSON");
          key = jsonKey.private_key;
          // Process the extracted key again
          key = key.replace(/\\n/g, "\n");
        }
      } catch (jsonErr) {
        console.log("Not valid JSON, continuing with normal processing");
      }
    }
    
    // 4. Check for BEGIN and END markers and add them if missing
    if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
      console.log("Adding missing BEGIN marker");
      key = "-----BEGIN PRIVATE KEY-----\n" + key;
    }
    
    if (!key.includes("-----END PRIVATE KEY-----")) {
      console.log("Adding missing END marker");
      key = key + "\n-----END PRIVATE KEY-----\n";
    }
    
    // 5. Ensure BEGIN marker has a newline after it
    if (!key.includes("-----BEGIN PRIVATE KEY-----\n")) {
      key = key.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
    }
    
    // 6. Ensure END marker has a newline before it
    if (!key.includes("\n-----END PRIVATE KEY-----")) {
      key = key.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
    }
    
    // 7. Add final newline if needed
    if (!key.endsWith("\n")) {
      key += "\n";
    }
    
    // 8. Verify the key has both markers now
    if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
      throw new Error("Failed to properly format private key with BEGIN and END markers");
    }
    
    console.log("Private key processed successfully");
    return key;
  } catch (err) {
    console.error("Error processing private key:", err);
    throw new Error("Failed to process Firebase private key");
  }
}

// Create a safe getter for auth that handles initialization failures
function safeGetAuth() {
  try {
    return firebaseAdmin ? admin.auth() : null;
  } catch (error) {
    console.error("Error getting auth service:", error);
    return null;
  }
}

// Create a safe getter for firestore that handles initialization failures
function safeGetFirestore() {
  try {
    return firebaseAdmin ? admin.firestore() : null;
  } catch (error) {
    console.error("Error getting firestore service:", error);
    return null;
  }
}

// Export the admin SDK and its services with safe getters
export default admin;
export const auth = safeGetAuth();
export const firestore = safeGetFirestore();
export const db = firestore;

// For compatibility with existing code
export const getAuth = () => safeGetAuth();
export const getFirestore = () => safeGetFirestore();
