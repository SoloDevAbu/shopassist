import { z } from "zod/v4"

// ── Cancel Subscription Body ────────────────────────────────────────

export const CancelSubscriptionBodySchema = z.object({
  customer_email: z
    .email("Invalid email format"),
  reason: z.string().optional(),
  call_sid: z.string().optional(),
})

export type CancelSubscriptionBody = z.infer<
  typeof CancelSubscriptionBodySchema
>
