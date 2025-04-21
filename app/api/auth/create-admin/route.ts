import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    console.log("Admin creation endpoint called")

    // Get request body
    const { email, password, secretKey } = await request.json()

    console.log("Request data received:", { email, hasPassword: !!password, hasSecretKey: !!secretKey })

    // Check secret key
    if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
      console.log("Invalid secret key provided")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("Secret key validated, creating user...")

    // Create the user
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    })

    console.log("User created successfully:", userRecord.uid)

    // Set custom claims to mark as admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true })

    console.log("Admin claims set successfully")

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      uid: userRecord.uid,
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create admin user",
      },
      { status: 500 },
    )
  }
}
