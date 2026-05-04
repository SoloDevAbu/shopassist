"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import * as React from "react"

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function AnimatedNumber({ value, suffix = "" }: { value: number | string, suffix?: string }) {
  const [display, setDisplay] = React.useState(0)
  const numValue = typeof value === "string" ? parseInt(value, 10) || 0 : value

  React.useEffect(() => {
    let start = 0
    const end = numValue
    if (start === end) {
      setDisplay(end)
      return
    }
    
    const duration = 1000 // 1s
    const startTime = performance.now()
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      setDisplay(Math.floor(progress * (end - start) + start))
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      }
    }
    
    requestAnimationFrame(updateNumber)
  }, [numValue])

  return <>{typeof value === "string" && isNaN(parseInt(value)) ? value : `${display}${suffix}`}</>
}

export function StatsBar() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Network response was not ok")
      return res.json()
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  })

  const stats = data?.data

  const cards = [
    { label: "Open Tickets", value: stats?.openTickets ?? 0, delay: 0 },
    { label: "Calls Today", value: stats?.callsToday ?? 0, delay: 0.05 },
    { label: "Automation Rate", value: stats?.automationRate ?? 0, suffix: "%", progress: stats?.automationRate ?? 0, delay: 0.1 },
    { label: "Avg Duration", value: stats?.avgDurationSeconds ? formatDuration(stats.avgDurationSeconds) : "0m 0s", rawNum: stats?.avgDurationSeconds ?? 0, delay: 0.15 }
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: card.delay, ease: "easeOut" }}
          className="bg-neutral-50 dark:bg-neutral-900 border-l-2 border-[#e8ff57] p-6 min-w-[200px] flex-1 flex flex-col justify-between"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-20 mb-2 rounded-none" />
              <Skeleton className="h-3 w-24 rounded-none" />
            </>
          ) : isError ? (
            <div className="text-red-500 font-mono text-sm">Error loading</div>
          ) : (
            <>
              <div className="font-mono text-4xl font-bold text-foreground mb-1 tracking-tighter">
                {card.label === "Avg Duration" ? card.value : <AnimatedNumber value={card.value as number} suffix={card.suffix} />}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                {card.label}
              </div>
              {card.progress !== undefined && (
                <div className="mt-4">
                  <Progress value={card.progress} className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-none [&>div]:bg-[#e8ff57] [&>div]:rounded-none" />
                </div>
              )}
            </>
          )}
        </motion.div>
      ))}
    </div>
  )
}
