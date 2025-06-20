import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

// Metadata must be defined before the component
export const metadata = {
  generator: 'v0.dev',
  title: 'OptimumStayHome',
  description: 'Book your perfect vacation rental'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Remove any data attributes that might cause hydration mismatches */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
