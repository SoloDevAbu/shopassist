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

export const CreateTicketBodySchema = z.object({
  callerPhone: z.string().optional(),
  customerEmail: z.email("Invalid email format").optional(),
  category: TicketCategory,
  description: z.string().min(1, "description is required"),
  priority: TicketPriority.optional(),
  callSid: z.string().optional(),
  orderId: z.string().optional(),
  source: TicketSource.optional(),
})

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
