import type React from "react"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Toast, ToastClose, ToastDescription, type ToastProps, ToastTitle } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

interface CustomToastProps extends ToastProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

export function CustomToast({ className, variant = "default", ...props }: CustomToastProps) {
  return (
    <Toast
      className={cn(
        className,
        variant === "destructive" && "border-red-200 bg-red-50 text-red-800",
        variant === "success" && "border-green-200 bg-green-50 text-green-800",
        variant === "warning" && "border-yellow-200 bg-yellow-50 text-yellow-800",
        variant === "info" && "border-blue-200 bg-blue-50 text-blue-800",
      )}
      {...props}
    />
  )
}

export function ToastIcon({ variant }: { variant?: "default" | "destructive" | "success" | "warning" | "info" }) {
  if (variant === "destructive") {
    return <AlertCircle className="h-5 w-5 text-red-600" />
  }
  if (variant === "success") {
    return <CheckCircle className="h-5 w-5 text-green-600" />
  }
  if (variant === "warning") {
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }
  if (variant === "info") {
    return <Info className="h-5 w-5 text-blue-600" />
  }
  return null
}

export function CustomToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <ToastTitle className={cn("flex items-center gap-2", className)} {...props} />
}

export function CustomToastDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <ToastDescription className={cn("text-sm", className)} {...props} />
}

export function CustomToastClose({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToastClose>) {
  return <ToastClose className={cn("absolute right-2 top-2 rounded-md p-1", className)} {...props} />
}
