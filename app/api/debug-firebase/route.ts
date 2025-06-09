import { NextResponse } from "next/server"

// This is required for static export
export const dynamic = "force-static"

export async function GET() {
  // Don't expose the actual private key, just check its format
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  
  // Safe information to return
  const envInfo = {
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    privateKeyStartsWith: privateKey ? privateKey.substring(0, 30) + "..." : null,
    privateKeyEndsWith: privateKey ? "..." + privateKey.substring(privateKey.length - 30) : null,
    privateKeyLength: privateKey ? privateKey.length : 0,
    privateKeyContainsBeginMarker: privateKey ? privateKey.includes("-----BEGIN PRIVATE KEY-----") : false,
    privateKeyContainsEndMarker: privateKey ? privateKey.includes("-----END PRIVATE KEY-----") : false,
    privateKeyContainsEscapedNewlines: privateKey ? privateKey.includes("\\n") : false,
    privateKeyContainsActualNewlines: privateKey ? privateKey.includes("\n") : false,
    privateKeyHasQuotes: privateKey ? (privateKey.startsWith('"') && privateKey.endsWith('"')) : false,
  }
  
  return NextResponse.json({ 
    success: true, 
    environment: process.env.NODE_ENV,
    envInfo
  })
}
