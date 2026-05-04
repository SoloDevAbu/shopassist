import { z } from "zod/v4"

// ── Bolna Webhook Payload ───────────────────────────────────────────

/**
 * Bolna sends different payloads per event type.
 * This schema validates the common shape and extracts event-specific data.
 */
export const BolnaWebhookPayloadSchema = z.object({
  event_id: z.string().min(1, "event_id is required"),
  event_type: z.enum([
    "call.initiated",
    "call.in_progress",
    "call.completed",
    "call.failed",
  ]),
  call_sid: z.string().min(1, "call_sid is required"),
  agent_id: z.string().optional(),
  from_number: z.string().optional(),
  to_number: z.string().optional(),
  timestamp: z.string().optional(),

  // Present on call.completed
  duration_seconds: z.number().optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  functions_called: z.array(z.string()).optional(),
})

export type BolnaWebhookPayload = z.infer<typeof BolnaWebhookPayloadSchema>
