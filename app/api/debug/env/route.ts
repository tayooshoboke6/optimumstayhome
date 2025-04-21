import { NextResponse } from "next/server"

export async function GET() {
  // Check Firebase Admin environment variables
  const envStatus = {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
    FIREBASE_PRIVATE_KEY_STARTS_WITH: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 27) === "-----BEGIN PRIVATE KEY-----"
      : false,
  }

  return NextResponse.json({
    message: "Environment variables status",
    envStatus,
  })
}
