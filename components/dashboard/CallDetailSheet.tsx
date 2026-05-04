"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OutcomeBadge } from "../shared/OutcomeBadge"
import { format } from "date-fns"

export function CallDetailSheet({ call, open, onOpenChange }: { call: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!call) return null

  // Process transcript to alternating blocks
  const transcriptLines = call.transcript?.split('\n').filter((l: string) => l.trim().length > 0) || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md border-l border-border bg-background p-0 rounded-none overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border bg-neutral-50 dark:bg-neutral-900 shrink-0">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-mono text-xl tracking-tighter text-left">
              {call.callerPhone || "Unknown Caller"}
            </SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Duration</div>
              <div className="font-mono text-foreground font-medium">{Math.floor((call.durationSeconds || 0) / 60)}m {(call.durationSeconds || 0) % 60}s</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Timestamp</div>
              <div className="font-mono text-foreground font-medium">{format(new Date(call.createdAt), "HH:mm:ss")}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <OutcomeBadge outcome={call.outcome} />
          </div>
          
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Functions Triggered</div>
            <div className="flex flex-wrap gap-2">
              {call.functionsCalled?.map((fn: string) => (
                <span key={fn} className="bg-neutral-200 dark:bg-neutral-800 text-foreground text-[10px] font-mono px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                  {fn.replace(/_/g, " ")}
                </span>
              ))}
              {(!call.functionsCalled || call.functionsCalled.length === 0) && (
                <span className="text-[10px] text-muted-foreground font-mono">NONE</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden p-0 flex flex-col">
          <div className="p-4 border-b border-border bg-neutral-100 dark:bg-neutral-950 shrink-0">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Transcript</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-background">
            <div className="space-y-4 pb-8 font-mono text-xs">
              {transcriptLines.length === 0 ? (
                <div className="text-muted-foreground italic">No transcript available.</div>
              ) : transcriptLines.map((line: string, i: number) => {
                const isAgent = line.toLowerCase().startsWith('agent:') || line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('shopassist:')
                
                return (
                  <div key={i} className={`p-3 border ${isAgent ? 'bg-neutral-50 dark:bg-neutral-900 border-border/50 ml-6' : 'bg-background border-border mr-6'}`}>
                    {line}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
