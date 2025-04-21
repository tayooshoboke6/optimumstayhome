import { toast } from "@/components/ui/use-toast"

// Types for notification functions
type NotificationOptions = {
  description?: string
  duration?: number
}

// Success notifications
export function notifySuccess(title: string, options?: NotificationOptions) {
  return toast({
    title,
    description: options?.description,
    duration: options?.duration || 5000,
    className: "bg-green-50 border-green-200",
    variant: "default",
  })
}

// Error notifications
export function notifyError(title: string, options?: NotificationOptions) {
  return toast({
    title,
    description: options?.description,
    duration: options?.duration || 7000,
    variant: "destructive",
  })
}

// Warning notifications
export function notifyWarning(title: string, options?: NotificationOptions) {
  return toast({
    title,
    description: options?.description,
    duration: options?.duration || 6000,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    variant: "default",
  })
}

// Info notifications
export function notifyInfo(title: string, options?: NotificationOptions) {
  return toast({
    title,
    description: options?.description,
    duration: options?.duration || 5000,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    variant: "default",
  })
}

// Activity notifications (for operations in progress)
export function notifyActivity(title: string, options?: NotificationOptions) {
  return toast({
    title,
    description: options?.description || "Please wait...",
    duration: options?.duration || 10000,
    className: "bg-gray-50 border-gray-200",
    variant: "default",
  })
}

// Notification for admin actions
export function notifyAdminAction(action: string, status: "success" | "error" | "pending", details?: string) {
  if (status === "success") {
    return notifySuccess(`${action} Successful`, { description: details })
  } else if (status === "error") {
    return notifyError(`${action} Failed`, { description: details })
  } else {
    return notifyActivity(`${action} in Progress`, { description: details })
  }
}

// Notification for booking actions
export function notifyBookingAction(action: string, status: "success" | "error" | "pending", details?: string) {
  return notifyAdminAction(`Booking ${action}`, status, details)
}

// Notification for settings actions
export function notifySettingsAction(setting: string, status: "success" | "error" | "pending", details?: string) {
  return notifyAdminAction(`${setting} Setting Updated`, status, details)
}
