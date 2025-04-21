"use client"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  unavailableDates?: Date[]
  placeholder?: string
  buttonDisabled?: boolean
}

export function DatePickerWithUnavailableDates({
  date,
  onSelect,
  disabled,
  unavailableDates = [],
  placeholder = "Pick a date",
  buttonDisabled = false,
}: DatePickerProps) {
  // Create a combined disabled function that checks both the provided disabled function
  // and if the date is in the unavailableDates array
  const isDisabled = (date: Date) => {
    if (disabled && disabled(date)) return true

    // Check if the date is in the unavailableDates array
    return unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getFullYear() === date.getFullYear() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getDate() === date.getDate(),
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={buttonDisabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={isDisabled}
          modifiers={{
            unavailable: unavailableDates,
          }}
          modifiersStyles={{
            unavailable: {
              textDecoration: "line-through",
              backgroundColor: "rgb(254 226 226)", // Light red background
              color: "rgb(185 28 28)", // Dark red text
            },
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
