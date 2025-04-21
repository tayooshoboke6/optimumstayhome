// Error handling utility for Firebase/Firestore operations
import { FirebaseError } from "firebase/app"

export interface ErrorDetails {
  code: string
  message: string
  details?: string
  suggestion?: string
}

export function handleFirebaseError(error: unknown): ErrorDetails {
  // Handle Firebase specific errors
  if (error instanceof FirebaseError) {
    const errorCode = error.code
    let suggestion = ""

    // Provide specific suggestions based on error codes
    if (errorCode.includes("permission-denied")) {
      suggestion =
        "This may be due to insufficient permissions. Please check your authentication status and Firestore rules."
    } else if (errorCode.includes("unavailable")) {
      suggestion = "The Firestore service is currently unavailable. Please try again later."
    } else if (errorCode.includes("unauthenticated")) {
      suggestion = "Your authentication session may have expired. Please sign in again."
    } else if (errorCode.includes("resource-exhausted")) {
      suggestion = "You've reached the quota limit for Firestore operations. Please try again later."
    } else if (errorCode.includes("failed-precondition")) {
      suggestion =
        "The operation failed because a condition wasn't met. This might be due to an index not being configured."
    }

    return {
      code: errorCode,
      message: error.message,
      details: JSON.stringify(error),
      suggestion,
    }
  }

  // Handle non-Firebase errors
  return {
    code: "unknown",
    message: error instanceof Error ? error.message : "An unknown error occurred",
    details: error instanceof Error ? error.stack : String(error),
  }
}

// Helper to create a retry mechanism for Firestore operations
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Firestore operation failed (attempt ${attempt + 1}/${maxRetries}):`, error)
      lastError = error

      // Don't retry for permission errors as they're unlikely to resolve with retries
      if (error instanceof FirebaseError && error.code.includes("permission-denied")) {
        break
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError
}
