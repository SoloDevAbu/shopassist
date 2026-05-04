"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriorityBadge } from "../shared/PriorityBadge"
import { StatusBadge } from "../shared/StatusBadge"
import { CopyButton } from "../shared/CopyButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

export function TicketDetailDialog({ ticketId, open, onOpenChange }: { ticketId: string | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = React.useState<string>("")
  const [error, setError] = React.useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      if (!ticketId) return null
      const res = await fetch(`/api/tickets/${ticketId}`)
      if (!res.ok) throw new Error("Failed to fetch ticket")
      return res.json()
    },
    enabled: !!ticketId,
  })

  const ticket = data?.data?.ticket

  React.useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status)
    }
  }, [ticket])

  const mutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error("Failed to update status")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      setError("")
    },
    onError: (err: any) => {
      setError(err.message)
    }
  })

  const handleStatusUpdate = () => {
    if (status && status !== ticket?.status) {
      mutation.mutate(status)
    }
  }

  if (!ticket && !isLoading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-none border-border bg-background gap-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-border bg-neutral-50 dark:bg-neutral-900">
              <DialogHeader className="mb-4 space-y-0 text-left">
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="font-mono text-3xl font-bold tracking-tighter flex items-center gap-3">
                    {ticket.ticketId}
                    <CopyButton value={ticket.ticketId} className="h-6 w-6" />
                  </DialogTitle>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground mt-6">
                <div>
                  <div className="mb-1 font-bold">Source</div>
                  <div className="text-foreground">{ticket.source.replace("_", " ")}</div>
                </div>
                <div>
                  <div className="mb-1 font-bold">Category</div>
                  <div className="text-foreground">{ticket.category}</div>
                </div>
                <div>
                  <div className="mb-1 font-bold">Created At</div>
                  <div className="text-foreground">{format(new Date(ticket.createdAt), "MMM d, HH:mm")}</div>
                </div>
                <div>
                  <div className="mb-1 font-bold">Caller / Cust</div>
                  <div className="text-foreground truncate" title={ticket.callerPhone || ticket.customerName || "Unknown"}>
                    {ticket.callerPhone || ticket.customerName || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <div className="px-6 border-b border-border bg-neutral-100 dark:bg-neutral-950">
                <TabsList className="bg-transparent p-0 h-auto gap-6">
                  <TabsTrigger 
                    value="details" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#e8ff57] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 py-3 uppercase text-xs tracking-widest font-bold"
                  >
                    Ticket Details
                  </TabsTrigger>
                  {ticket.callLog && (
                    <TabsTrigger 
                      value="call" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#e8ff57] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 py-3 uppercase text-xs tracking-widest font-bold"
                    >
                      Call Log
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <div className="p-6 h-[250px] overflow-y-auto">
                <TabsContent value="details" className="mt-0 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
                    <p className="text-sm whitespace-pre-wrap font-mono leading-relaxed bg-neutral-50 dark:bg-neutral-900 p-4 border border-border">
                      {ticket.description || "No description provided."}
                    </p>
                  </div>
                  
                  {ticket.order && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Related Order</h4>
                      <div className="flex items-center gap-4 bg-background border border-border p-3">
                        <span className="font-mono font-bold text-sm">{ticket.order.orderId}</span>
                        <StatusBadge status={ticket.order.status} />
                        <span className="text-sm text-muted-foreground ml-auto">₹{ticket.order.totalAmount}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {ticket.callLog && (
                  <TabsContent value="call" className="mt-0 space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Call Summary</h4>
                      <p className="text-sm border-l-2 border-[#e8ff57] pl-3 py-1 italic">
                        "{ticket.callLog.summary}"
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Functions Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.callLog.functionsCalled?.map((fn: string) => (
                          <span key={fn} className="bg-neutral-200 dark:bg-neutral-800 text-xs font-mono px-2 py-1">
                            {fn}
                          </span>
                        ))}
                        {(!ticket.callLog.functionsCalled || ticket.callLog.functionsCalled.length === 0) && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>

            <div className="p-6 border-t border-border bg-neutral-50 dark:bg-neutral-900 flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Update Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-none bg-background border-border font-mono text-sm uppercase tracking-wider font-bold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="open">OPEN</SelectItem>
                    <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                    <SelectItem value="resolved">RESOLVED</SelectItem>
                    <SelectItem value="closed">CLOSED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleStatusUpdate}
                disabled={status === ticket.status || mutation.isPending}
                className="rounded-none bg-[#e8ff57] hover:bg-[#d4e945] text-black font-bold uppercase tracking-wider w-[140px]"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
            {error && <div className="px-6 pb-4 bg-neutral-50 dark:bg-neutral-900 text-red-500 text-xs font-bold text-right">{error}</div>}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
