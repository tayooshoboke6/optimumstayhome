import { NextResponse } from "next/server"
import { getAuth } from "@/lib/firebase-admin-json"

export async function POST(request: Request) {
  try {
    // This should be protected with a secret key in production
    const { email, secretKey } = await request.json()

    // Verify secret key
    if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const auth = getAuth()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Auth service unavailable" }, { status: 500 })
    }

    // Find user by email
    const user = await auth.getUserByEmail(email)

    // Set admin claim
    await auth.setCustomUserClaims(user.uid, { admin: true })

    return NextResponse.json({
      success: true,
      message: "Admin claim set successfully",
      uid: user.uid,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
