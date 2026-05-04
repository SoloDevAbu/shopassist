"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PriorityBadge } from "../shared/PriorityBadge"
import { StatusBadge } from "../shared/StatusBadge"
import { RelativeTime } from "../shared/RelativeTime"
import { Phone, Globe, X } from "lucide-react"
import { TicketDetailDialog } from "./TicketDetailDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function TicketTable() {
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null)
  
  // Filters state
  const [status, setStatus] = React.useState<string>("all")
  const [priority, setPriority] = React.useState<string>("all")
  const [source, setSource] = React.useState<string>("all")
  const [category, setCategory] = React.useState<string>("all")
  const [search, setSearch] = React.useState<string>("")

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets?limit=100")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    refetchInterval: 5000,
  })

  const tickets = data?.data?.tickets || []

  // Client side filtering
  const filteredTickets = tickets.filter((t: any) => {
    if (status !== "all" && t.status !== status) return false
    if (priority !== "all" && t.priority !== priority) return false
    if (source !== "all" && t.source !== source) return false
    if (category !== "all" && t.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return t.ticketId.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    }
    return true
  })

  const hasFilters = status !== "all" || priority !== "all" || source !== "all" || category !== "all" || !!search

  const clearFilters = () => {
    setStatus("all")
    setPriority("all")
    setSource("all")
    setCategory("all")
    setSearch("")
  }

  return (
    <div className="flex flex-col h-full bg-background border border-border">
      <div className="p-4 border-b border-border bg-neutral-50 dark:bg-neutral-900 space-y-4 shrink-0">
        <div className="flex flex-wrap gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px] rounded-none bg-background text-xs font-mono uppercase tracking-wider font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">ALL STATUS</SelectItem>
              <SelectItem value="open">OPEN</SelectItem>
              <SelectItem value="in_progress">IN PROGRESS</SelectItem>
              <SelectItem value="resolved">RESOLVED</SelectItem>
              <SelectItem value="closed">CLOSED</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[130px] rounded-none bg-background text-xs font-mono uppercase tracking-wider font-bold">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">ALL PRIORITIES</SelectItem>
              <SelectItem value="high">HIGH</SelectItem>
              <SelectItem value="medium">MEDIUM</SelectItem>
              <SelectItem value="low">LOW</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[130px] rounded-none bg-background text-xs font-mono uppercase tracking-wider font-bold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">ALL CATEGORIES</SelectItem>
              <SelectItem value="order">ORDER</SelectItem>
              <SelectItem value="refund">REFUND</SelectItem>
              <SelectItem value="subscription">SUBSCRIPTION</SelectItem>
              <SelectItem value="general">GENERAL</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Search ID or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none bg-background font-mono text-xs placeholder:uppercase placeholder:tracking-wider placeholder:font-bold"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active Filters:</span>
            {status !== "all" && <Badge variant="secondary" className="rounded-none text-[10px] font-mono px-1 border border-border">Status: {status}</Badge>}
            {priority !== "all" && <Badge variant="secondary" className="rounded-none text-[10px] font-mono px-1 border border-border">Priority: {priority}</Badge>}
            <button onClick={clearFilters} className="text-[10px] text-red-500 uppercase tracking-widest font-bold hover:underline ml-2 flex items-center">
              <X className="h-3 w-3 mr-1" /> Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-background">
        <Table>
          <TableHeader className="bg-neutral-100 dark:bg-neutral-950 sticky top-0 z-10 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[120px]">Ticket ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[100px]">Category</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[100px]">Priority</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[120px]">Status</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[80px]">Source</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest w-[120px]">Created</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full rounded-none" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground font-mono text-sm uppercase tracking-wider font-bold">
                  No tickets match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket: any) => (
                <TableRow key={ticket.id} className="cursor-pointer group hover:bg-neutral-50 dark:hover:bg-neutral-900/50" onClick={() => setSelectedTicketId(ticket.id)}>
                  <TableCell className="font-mono font-bold text-xs group-hover:text-[#afc524] transition-colors">{ticket.ticketId}</TableCell>
                  <TableCell className="uppercase text-[10px] font-bold tracking-wider">{ticket.category}</TableCell>
                  <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell>
                    {ticket.source === "voice_agent" ? (
                      <span title="Voice Agent"><Phone className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" /></span>
                    ) : (
                      <span title="Web Portal"><Globe className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" /></span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground"><RelativeTime date={ticket.createdAt} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-none text-[10px] font-bold uppercase tracking-widest h-7 px-2 hover:bg-[#e8ff57] hover:text-black">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TicketDetailDialog 
        ticketId={selectedTicketId} 
        open={!!selectedTicketId} 
        onOpenChange={(open) => !open && setSelectedTicketId(null)} 
      />
    </div>
  )
}
