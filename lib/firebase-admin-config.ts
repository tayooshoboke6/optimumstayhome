// This file contains only the configuration for Firebase Admin
// It doesn't import Firebase Admin itself

export const getFirebaseAdminConfig = () => {
  // Only run on server
  if (typeof window !== "undefined") {
    return null
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK initialization failed: Missing environment variables")
      return null
    }

    return {
      credential: {
        projectId,
        clientEmail,
        privateKey,
      },
    }
  } catch (error) {
    console.error("Error preparing Firebase Admin config:", error)
    return null
  }
}
