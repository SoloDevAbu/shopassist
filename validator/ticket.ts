import { z } from "zod/v4"

const TicketCategory = z.enum([
  "order",
  "refund",
  "shipping",
  "billing",
  "product",
  "subscription",
  "other",
])

const TicketPriority = z.enum(["low", "medium", "high"])

const TicketStatus = z.enum(["open", "in_progress", "resolved", "closed"])

const TicketSource = z.enum(["voice_agent", "web_portal"])

// ── Create Ticket Body ──────────────────────────────────────────────

export const CreateTicketBodySchema = z
  .object({
    callerPhone: z.string().optional(),
    caller_phone: z.string().optional(), // alias sent by Bolna voice agent
    customerEmail: z.email("Invalid email format").optional(),
    customer_email: z.email("Invalid email format").optional(), // alias sent by Bolna voice agent
    category: TicketCategory.optional(),
    issue_category: TicketCategory.optional(), // alias sent by Bolna voice agent
    description: z.string().min(1, "description is required"),
    priority: TicketPriority.optional(),
    callSid: z.string().optional(),
    call_sid: z.string().optional(), // alias sent by Bolna voice agent
    orderId: z.string().optional(),
    order_id: z.string().optional(), // alias sent by Bolna voice agent
    source: TicketSource.optional(),
  })
  .transform((data) => ({
    callerPhone: data.callerPhone ?? data.caller_phone,
    customerEmail: data.customerEmail ?? data.customer_email,
    // category is required — accept issue_category as fallback, default to "other"
    category: (data.category ?? data.issue_category ?? "other") as z.infer<
      typeof TicketCategory
    >,
    description: data.description,
    priority: data.priority,
    callSid: data.callSid ?? data.call_sid,
    orderId: data.orderId ?? data.order_id,
    source: data.source,
  }))

export type CreateTicketBody = z.infer<typeof CreateTicketBodySchema>

// ── Update Ticket Body ──────────────────────────────────────────────

export const UpdateTicketBodySchema = z.object({
  status: TicketStatus,
})

export type UpdateTicketBody = z.infer<typeof UpdateTicketBodySchema>

// ── List Tickets Query ──────────────────────────────────────────────

export const ListTicketsQuerySchema = z.object({
  status: TicketStatus.optional(),
  priority: TicketPriority.optional(),
  category: TicketCategory.optional(),
  source: TicketSource.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type ListTicketsQuery = z.infer<typeof ListTicketsQuerySchema>
