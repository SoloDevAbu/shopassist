"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { RelativeTime } from "../shared/RelativeTime"
import { OutcomeBadge } from "../shared/OutcomeBadge"
import { CallDetailSheet } from "./CallDetailSheet"
import { Skeleton } from "@/components/ui/skeleton"

export function CallLogList() {
  const [selectedCall, setSelectedCall] = React.useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["calls"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/calls")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    refetchInterval: 5000,
  })

  const calls = data?.data || []

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-background">
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Recent Calls</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-none" />
          ))
        ) : calls.length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center font-mono">No calls recorded yet.</div>
        ) : (
          calls.map((call: any) => (
            <div 
              key={call.id} 
              onClick={() => setSelectedCall(call)}
              className="border border-border bg-background p-4 cursor-pointer hover:border-[#e8ff57] transition-colors flex flex-col gap-3 group"
            >
              <div className="flex justify-between items-start">
                <div className="font-mono font-bold text-sm group-hover:text-[#afc524] transition-colors">{call.callerPhone || "Unknown"}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-mono">{Math.floor((call.durationSeconds || 0) / 60)}m {(call.durationSeconds || 0) % 60}s</span>
                  <span>·</span>
                  <RelativeTime date={call.createdAt} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {call.functionsCalled?.slice(0, 2).map((fn: string) => (
                  <span key={fn} className="bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono px-1.5 py-0.5 uppercase tracking-wider font-bold">
                    {fn.replace(/_/g, " ")}
                  </span>
                ))}
                {call.functionsCalled?.length > 2 && (
                  <span className="bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono px-1.5 py-0.5">
                    +{call.functionsCalled.length - 2}
                  </span>
                )}
                {(!call.functionsCalled || call.functionsCalled.length === 0) && (
                  <span className="text-[10px] text-muted-foreground italic font-mono uppercase tracking-wider">No functions</span>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground truncate border-l-2 border-border pl-2">
                "{call.summary || "No summary available."}"
              </div>
              
              <div className="mt-auto pt-2">
                <OutcomeBadge outcome={call.outcome} />
              </div>
            </div>
          ))
        )}
      </div>

      <CallDetailSheet 
        call={selectedCall} 
        open={!!selectedCall} 
        onOpenChange={(open) => !open && setSelectedCall(null)} 
      />
    </div>
  )
}
