"use client"

import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useState, useEffect } from "react"

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    console.log("Signing in with:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("User credential obtained:", userCredential.user.uid)

    // Get the ID token
    const idToken = await userCredential.user.getIdToken()
    console.log("ID token obtained, length:", idToken.length)

    // Send the ID token to the server to create a session cookie
    console.log("Sending ID token to server...")
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    console.log("Server response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Session creation failed:", errorData)
      throw new Error("Failed to create session: " + (errorData.error || response.statusText))
    }

    const data = await response.json()
    console.log("Session created successfully:", data)

    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("Error signing in:", error)
    return {
      success: false,
      error:
        error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.code === "auth/user-not-found"
            ? "User not found"
            : error.code === "auth/wrong-password"
              ? "Incorrect password"
              : error.code === "auth/operation-not-allowed"
                ? "Email/password sign-in is not enabled. Please contact the administrator."
                : error.message || "An error occurred during sign in",
    }
  }
}

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth)

    // Clear the session cookie
    await fetch("/api/auth/session", {
      method: "DELETE",
    })

    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { success: false }
  }
}

// Custom hook to get the current user
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
