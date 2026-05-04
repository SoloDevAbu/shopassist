"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, CheckCircle, Loader2, AlertCircle } from "lucide-react"

type CallState = "idle" | "loading" | "calling" | "error"

export function CallbackForm() {
  const [phone, setPhone] = React.useState("")
  const [callState, setCallState] = React.useState<CallState>("idle")
  const [errorMessage, setErrorMessage] = React.useState("")
  const [callId, setCallId] = React.useState<string | null>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
    setPhone(digits)
  }

  const handleCall = async () => {
    if (phone.length < 10) return
    setCallState("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/bolna/initiate-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: `+91${phone}` }),
      })

      const data = await res.json()

      if (data.success) {
        setCallId(data.callId)
        setCallState("calling")
      } else {
        setErrorMessage(data.error?.message ?? "Something went wrong. Please try again.")
        setCallState("error")
      }
    } catch {
      setErrorMessage("Network error. Please check your connection.")
      setCallState("error")
    }
  }

  const handleReset = () => {
    setPhone("")
    setCallState("idle")
    setErrorMessage("")
    setCallId(null)
  }

  return (
    <div className="space-y-8">
      {/* ── Voice Callback Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-bold text-sm uppercase tracking-widest">Voice Callback</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6 pl-7">
          Enter your number — our AI agent calls you within seconds.
        </p>

        <AnimatePresence mode="wait">
          {callState === "calling" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border-l-4 border-[#e8ff57] bg-neutral-50 dark:bg-neutral-900 p-6"
            >
              <div className="flex items-start gap-4">
                <CheckCircle className="h-5 w-5 text-[#afc524] mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-sm uppercase tracking-widest mb-2">Calling +91 {phone}</div>
                  <div className="text-muted-foreground text-sm mb-4">
                    Your phone will ring in a few seconds. The agent already knows your recent order details.
                  </div>
                  {callId && (
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      Call ID: {callId}
                    </div>
                  )}
                  <button
                    onClick={handleReset}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Request another call
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex gap-0">
                {/* +91 prefix */}
                <div className="flex items-center border border-r-0 border-border bg-neutral-100 dark:bg-neutral-800 px-3 font-mono text-sm font-bold text-muted-foreground select-none">
                  +91
                </div>
                <Input
                  id="phone-number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && handleCall()}
                  className="rounded-none border-border font-mono text-sm flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#e8ff57]"
                  maxLength={10}
                  disabled={callState === "loading"}
                />
              </div>

              {callState === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-500 text-xs font-bold"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errorMessage}
                </motion.div>
              )}

              <Button
                id="call-me-now-btn"
                onClick={handleCall}
                disabled={phone.length !== 10 || callState === "loading"}
                className="w-full rounded-none bg-[#e8ff57] hover:bg-[#d4e945] text-black font-bold uppercase tracking-widest h-12 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {callState === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Me Now
                  </span>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Average wait: under 10 seconds · No hold music · AI-powered
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
