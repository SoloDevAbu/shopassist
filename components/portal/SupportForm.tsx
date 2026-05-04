"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { TicketSuccessCard } from "./TicketSuccessCard"
import { AnimatePresence, motion } from "framer-motion"

export function SupportForm() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [successData, setSuccessData] = React.useState<any>(null)
  
  const [desc, setDesc] = React.useState("")
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const payload = {
      customerName: formData.get("name"),
      customerEmail: formData.get("email"),
      category: formData.get("category"),
      description: formData.get("description"),
      source: "web_portal",
      ...(formData.get("orderId") ? { orderId: formData.get("orderId") } : {})
    }

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error?.message || "Failed to create ticket")
      
      setSuccessData(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!successData ? (
          <motion.form 
            key="form"
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                <Input name="name" required disabled={loading} className="rounded-none bg-neutral-50 dark:bg-neutral-900 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                <Input name="email" type="email" required disabled={loading} className="rounded-none bg-neutral-50 dark:bg-neutral-900 border-border" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                <Select name="category" required disabled={loading} defaultValue="general">
                  <SelectTrigger className="rounded-none bg-neutral-50 dark:bg-neutral-900 border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="refund">Refund Request</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="general">General Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID <span className="font-normal lowercase opacity-70">(Optional)</span></label>
                <Input name="orderId" placeholder="ORD-XXXXX" disabled={loading} className="font-mono uppercase rounded-none bg-neutral-50 dark:bg-neutral-900 border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <div className="relative">
                <Textarea 
                  name="description" 
                  required 
                  disabled={loading}
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="rounded-none bg-neutral-50 dark:bg-neutral-900 border-border resize-none pb-8"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground font-mono">
                  {desc.length} chars
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded-none bg-[#e8ff57] hover:bg-[#d4e945] text-black font-bold uppercase tracking-wider"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Ticket
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TicketSuccessCard 
              ticketId={successData.ticketId} 
              priority={successData.priority}
              onReset={() => {
                setSuccessData(null)
                setDesc("")
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
