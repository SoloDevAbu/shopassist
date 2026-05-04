"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { OrderResultCard } from "./OrderResultCard"

export function OrderLookupForm() {
  const [orderId, setOrderId] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [result, setResult] = React.useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch(
        `/api/orders/user/status?order_id=${encodeURIComponent(orderId)}`
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch order")
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 space-y-2">
          <Input
            placeholder="ORD-XXXXX"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            disabled={loading}
            className={`rounded-none border-border bg-neutral-50 font-mono uppercase dark:bg-neutral-900 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
        <Button
          type="submit"
          disabled={loading || !orderId.trim()}
          className="w-full min-w-[120px] rounded-none bg-primary text-xs font-bold tracking-wider text-primary-foreground uppercase hover:bg-primary/90 sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look Up"}
        </Button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <OrderResultCard order={result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
