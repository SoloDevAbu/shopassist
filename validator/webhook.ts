import { z } from "zod/v4"

/**
 * Bolna webhook payload = the raw execution object.
 * Identical to the response from GET /executions/:id.
 * Reference: https://www.bolna.ai/docs/polling-call-status-webhooks.md
 */
export const BolnaWebhookPayloadSchema = z.object({
  // Identity — "id" is the execution_id / call identifier
  id: z.string().min(1, "id is required"),
  agent_id: z.string().optional(),

  // Status changes: scheduled → queued → in-progress → completed | failed | cancelled
  status: z.enum([
    "scheduled",
    "queued",
    "in-progress",
    "completed",
    "failed",
    "cancelled",
  ]),

  // Phone numbers (present once call connects)
  to_number: z.string().optional(),   // customer's phone
  from_number: z.string().optional(), // Bolna's number

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),

  // Duration in seconds — only on completed/failed
  duration: z.number().optional(),

  // Content — only on completed
  transcript: z.string().optional(),
  summary: z.string().optional(),
  recording_url: z.string().optional(),

  // Function calls made during the call
  tool_calls: z
    .array(
      z.object({
        name: z.string(),
        input: z.record(z.string(), z.unknown()).optional(),
        output: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),

  // Post-call extractions (if configured in Analytics Tab)
  extractions: z.record(z.string(), z.string()).optional(),
})

export type BolnaWebhookPayload = z.infer<typeof BolnaWebhookPayloadSchema>
