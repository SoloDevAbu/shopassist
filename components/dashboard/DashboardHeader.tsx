"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function DashboardHeader() {
  const queryClient = useQueryClient()
  const [lastRefreshed, setLastRefreshed] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      const updatedAt = queryClient.getQueryState(["stats"])?.dataUpdatedAt || Date.now()
      setLastRefreshed(Math.floor((Date.now() - updatedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [queryClient])

  return (
    <header className="border-b border-border h-16 flex items-center justify-between px-6 bg-background shrink-0">
      <div className="font-mono font-bold tracking-tighter text-lg flex items-center gap-2">
        ShopAssist Ops
        <span className="flex h-2 w-2 relative ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8ff57] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8ff57]"></span>
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">Live</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider hidden sm:block">
          Last refreshed: {lastRefreshed}s ago
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
