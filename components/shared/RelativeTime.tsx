"use client"

import * as React from "react"
import { formatDistanceToNow, format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function RelativeTime({ date }: { date: Date | string | null }) {
  const [mounted, setMounted] = React.useState(false)
  const [time, setTime] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
    if (!date) return

    const parsedDate = new Date(date)
    
    const updateTime = () => {
      setTime(formatDistanceToNow(parsedDate, { addSuffix: true }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    
    return () => clearInterval(interval)
  }, [date])

  if (!date || !mounted) return <span className="text-muted-foreground">-</span>

  const parsedDate = new Date(date)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-2">
          {time}
        </span>
      </TooltipTrigger>
      <TooltipContent className="rounded-none bg-popover text-popover-foreground border border-border shadow-sm font-mono text-xs">
        <p>{format(parsedDate, "PPpp")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
