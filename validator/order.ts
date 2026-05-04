import { z } from "zod/v4"

// ── Order Status Query ──────────────────────────────────────────────

export const OrderStatusQuerySchema = z.object({
  order_id: z.string().min(1, "order_id is required"),
  call_sid: z.string().optional(),
})

export type OrderStatusQuery = z.infer<typeof OrderStatusQuerySchema>

// ── Cancel Order Body ───────────────────────────────────────────────

export const CancelOrderBodySchema = z.object({
  order_id: z.string().min(1, "order_id is required"),
  customer_email: z
    .email("Invalid email format"),
  call_sid: z.string().optional(),
})

export type CancelOrderBody = z.infer<typeof CancelOrderBodySchema>

// ── Refund Status Query ─────────────────────────────────────────────

export const RefundStatusQuerySchema = z.object({
  order_id: z.string().min(1, "order_id is required"),
  call_sid: z.string().optional(),
})

export type RefundStatusQuery = z.infer<typeof RefundStatusQuerySchema>
