import { CallOutcome } from "../types"

/**
 * Outcome classifier — pure function.
 * Called once per call in the call.completed webhook handler.
 *
 * Decision matrix:
 * ┌───────────────────────────┬──────────────────┬─────────────────┬────────────┐
 * │ functionsCalled.length    │ wasTicketCreated  │ durationSeconds │ outcome    │
 * ├───────────────────────────┼──────────────────┼─────────────────┼────────────┤
 * │ > 0                      │ false            │ any             │ resolved   │
 * │ > 0                      │ true             │ any             │ escalated  │
 * │ 0                        │ true             │ any             │ escalated  │
 * │ 0                        │ false            │ any             │ failed     │
 * └───────────────────────────┴──────────────────┴─────────────────┴────────────┘
 *
 * resolved  — Agent handled the issue without human intervention ("AI win")
 * escalated — A support ticket was created, human follow-up needed
 * failed    — No functions called, call ended without useful action
 */
export function classifyOutcome(
  functionsCalled: string[],
  wasTicketCreated: boolean,
  durationSeconds: number
): CallOutcome {
  // If a ticket was created → escalated (regardless of functions called)
  if (wasTicketCreated) {
    return "escalated"
  }

  // If at least one function was called and no ticket → resolved
  if (functionsCalled.length > 0) {
    return "resolved"
  }

  // No functions called, no ticket → failed
  return "failed"
}
