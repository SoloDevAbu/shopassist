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

export function CallDetailSheet({
  call,
  open,
  onOpenChange,
}: {
  call: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!call) return null

  // Process transcript to alternating blocks
  const transcriptLines =
    call.transcript?.split("\n").filter((l: string) => l.trim().length > 0) ||
    []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden rounded-none border-l border-border bg-background p-0 sm:max-w-md">
        <div className="shrink-0 border-b border-border bg-neutral-50 p-6 dark:bg-neutral-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-mono text-xl tracking-tighter">
              {call.callerPhone || "Unknown Caller"}
            </SheetTitle>
          </SheetHeader>

          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="mb-1 text-[10px] tracking-widest text-muted-foreground uppercase">
                Duration
              </div>
              <div className="font-mono font-medium text-foreground">
                {Math.floor((call.durationSeconds || 0) / 60)}m{" "}
                {(call.durationSeconds || 0) % 60}s
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] tracking-widest text-muted-foreground uppercase">
                Timestamp
              </div>
              <div className="font-mono font-medium text-foreground">
                {format(new Date(call.createdAt), "HH:mm:ss")}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <OutcomeBadge outcome={call.outcome} />
          </div>

          <div>
            <div className="mb-2 text-[10px] tracking-widest text-muted-foreground uppercase">
              Functions Triggered
            </div>
            <div className="flex flex-wrap gap-2">
              {call.functionsCalled?.map((fn: string) => (
                <span
                  key={fn}
                  className="rounded-none bg-neutral-200 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-foreground uppercase dark:bg-neutral-800"
                >
                  {fn.replace(/_/g, " ")}
                </span>
              ))}
              {(!call.functionsCalled || call.functionsCalled.length === 0) && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  NONE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="shrink-0 border-b border-border bg-neutral-100 p-4 dark:bg-neutral-950">
            <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Transcript
            </h3>
          </div>

          <ScrollArea className="flex-1 h-full bg-background">
            <div className="space-y-4 pb-8 font-mono text-xs p-4">
              {transcriptLines.length === 0 ? (
                <div className="text-muted-foreground italic">
                  No transcript available.
                </div>
              ) : (
                transcriptLines.map((line: string, i: number) => {
                  const isAgent =
                    line.toLowerCase().startsWith("agent:") ||
                    line.toLowerCase().startsWith("ai:") ||
                    line.toLowerCase().startsWith("shopassist:")

                  return (
                    <div
                      key={i}
                      className={`border p-3 ${isAgent ? "ml-6 border-border/50 bg-neutral-50 dark:bg-neutral-900" : "mr-6 border-border bg-background"}`}
                    >
                      {line}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
