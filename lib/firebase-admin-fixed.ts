import admin from "firebase-admin";
import { getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin with robust private key handling
// This version ensures proper handling of the private key format
// and provides better TypeScript support for the auth and firestore objects

// Check if Firebase Admin is already initialized
const apps = getApps();

// Initialize the Firebase Admin SDK if it hasn't been initialized yet
if (!apps.length) {
  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Log environment variable presence (not values for security)
    console.log("Initializing Firebase...");
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
    admin.initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
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
    
    // 3. Check for BEGIN and END markers
    if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
      console.error("Private key missing BEGIN marker");
      throw new Error("Private key does not contain BEGIN marker");
    }
    
    if (!key.includes("-----END PRIVATE KEY-----")) {
      console.error("Private key missing END marker");
      throw new Error("Private key does not contain END marker");
    }
    
    // 4. Ensure BEGIN marker has a newline after it
    if (!key.includes("-----BEGIN PRIVATE KEY-----\n")) {
      key = key.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
    }
    
    // 5. Ensure END marker has a newline before it
    if (!key.includes("\n-----END PRIVATE KEY-----")) {
      key = key.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
    }
    
    // 6. Add final newline if needed
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

// Export the admin SDK and its services
export default admin;
export const auth = admin.auth();
export const firestore = admin.firestore();

// For compatibility with existing code
export const getAuth = () => admin.auth();
export const getFirestore = () => admin.firestore();
export const db = firestore;
