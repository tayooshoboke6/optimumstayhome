import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "white"
  className?: string
  text?: string
  subText?: string
}

export function LoadingSpinner({ size = "md", color = "primary", className, text, subText }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const innerSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const colorClasses = {
    primary: "border-t-[#E9A23B] border-r-[#E9A23B] border-b-[#E9A23B]/40 border-l-[#E9A23B]/40",
    white: "border-t-white border-r-white border-b-white/40 border-l-white/40",
  }

  const textColorClasses = {
    primary: "text-[#E9A23B]",
    white: "text-white",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        <div className={cn("rounded-full border-4 animate-spin", sizeClasses[size], colorClasses[color])}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn("rounded-full bg-white", innerSizeClasses[size])}></div>
        </div>
      </div>
      {text && (
        <div className="text-center">
          <p className={cn("font-medium", textColorClasses[color])}>{text}</p>
          {subText && <p className="text-sm text-gray-500 mt-1">{subText}</p>}
        </div>
      )}
    </div>
  )
}
