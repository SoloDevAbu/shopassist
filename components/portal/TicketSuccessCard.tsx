"use client"

import { PriorityBadge } from "../shared/PriorityBadge"
import { CopyButton } from "../shared/CopyButton"
import { Button } from "@/components/ui/button"
import type { TicketPriority } from "@/types"

export function TicketSuccessCard({ 
  ticketId, 
  priority, 
  onReset 
}: { 
  ticketId: string
  priority: TicketPriority
  onReset: () => void 
}) {
  return (
    <div className="border border-border p-8 flex flex-col items-center justify-center text-center space-y-6 bg-neutral-50 dark:bg-neutral-900">
      <div className="space-y-2">
        <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Ticket Created</h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-bold">{ticketId}</span>
          <CopyButton value={ticketId} className="h-8 w-8" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <PriorityBadge priority={priority} />
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Our team will respond within 24 hours. We've sent a confirmation to your email.
        </p>
      </div>

      <Button variant="ghost" onClick={onReset} className="mt-4 rounded-none uppercase text-xs tracking-wider">
        Submit another ticket
      </Button>
    </div>
  )
}
