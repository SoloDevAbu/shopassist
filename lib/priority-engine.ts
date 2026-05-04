import type {
  Order,
  Subscription,
} from "../app/generated/prisma/client"
import { TicketPriority } from "../types"

/**
 * Priority inference engine — pure function.
 * No DB calls. No side effects. Fully unit-testable.
 *
 * Evaluated top-to-bottom, first matching rule wins.
 * After initial priority, subscription tier bump is applied.
 */

// ── Keyword groups ──────────────────────────────────────────────────

const HIGH_KEYWORDS_DELIVERY = [
  "not delivered",
  "never arrived",
  "missing",
  "lost",
  "not received",
]

const HIGH_KEYWORDS_FINANCIAL = [
  "charged twice",
  "double charge",
  "unauthorized",
  "fraud",
]

const HIGH_KEYWORDS_URGENCY = ["urgent", "asap", "emergency", "immediately"]

const MEDIUM_KEYWORDS_PRODUCT = [
  "damaged",
  "broken",
  "wrong item",
  "defective",
  "not working",
  "doesn't work",
]

const MEDIUM_KEYWORDS_DELIVERY = ["late", "delayed", "taking too long"]

// ── Rule type ───────────────────────────────────────────────────────

type PriorityRule = {
  condition: (desc: string, order?: Order | null) => boolean
  result: TicketPriority
}

// ── Rule set ────────────────────────────────────────────────────────

const RULES: PriorityRule[] = [
  // HIGH: Delivered but customer says not received — fraud/theft risk
  {
    condition: (desc, order) =>
      HIGH_KEYWORDS_DELIVERY.some((kw) => desc.includes(kw)) &&
      order?.status === "delivered",
    result: "high",
  },
  // HIGH: Financial disputes — legal risk
  {
    condition: (desc) =>
      HIGH_KEYWORDS_FINANCIAL.some((kw) => desc.includes(kw)),
    result: "high",
  },
  // HIGH: High-value order with refund/cancel intent
  {
    condition: (desc, order) =>
      (order?.totalAmount ?? 0) > 5000 &&
      (desc.includes("refund") ||
        desc.includes("cancel") ||
        desc.includes("return")),
    result: "high",
  },
  // HIGH: Customer explicitly signaled urgency
  {
    condition: (desc) =>
      HIGH_KEYWORDS_URGENCY.some((kw) => desc.includes(kw)),
    result: "high",
  },
  // MEDIUM: Product issues
  {
    condition: (desc) =>
      MEDIUM_KEYWORDS_PRODUCT.some((kw) => desc.includes(kw)),
    result: "medium",
  },
  // MEDIUM: Delivery delays
  {
    condition: (desc) =>
      MEDIUM_KEYWORDS_DELIVERY.some((kw) => desc.includes(kw)),
    result: "medium",
  },
  // MEDIUM: Shipped but estimated delivery is overdue
  {
    condition: (_desc, order) =>
      order?.status === "shipped" &&
      order?.estimatedDelivery != null &&
      new Date(order.estimatedDelivery) < new Date(),
    result: "medium",
  },
]

// ── Priority comparison ─────────────────────────────────────────────

const PRIORITY_RANK: Record<TicketPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
}

function bumpPriority(priority: TicketPriority): TicketPriority {
  if (priority === "low") return "medium"
  if (priority === "medium") return "high"
  return "high"
}

// ── Main function ───────────────────────────────────────────────────

export function inferPriority(
  description: string,
  order?: Order | null,
  subscription?: Subscription | null
): TicketPriority {
  const desc = description.toLowerCase()

  // Evaluate rules top-to-bottom, first match wins
  const matchedRule = RULES.find((rule) => rule.condition(desc, order))
  let priority: TicketPriority = matchedRule?.result ?? "low"

  // Subscription tier bump: paying customers get +1 priority level
  if (subscription?.status === "active") {
    priority = bumpPriority(priority)
  }

  return priority
}
