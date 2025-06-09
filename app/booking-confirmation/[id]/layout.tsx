// This file is needed for static export with dynamic routes
export function generateStaticParams() {
  return [
    { id: "placeholder" },
  ]
}

export default function BookingConfirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
