import { z } from "zod/v4"

/**
 * Bolna webhook payload = the raw execution object.
 * Identical to the response from GET /executions/:id.
 * Reference: https://www.bolna.ai/docs/polling-call-status-webhooks.md
 */
export const BolnaWebhookPayloadSchema = z.object({
  // Identity — "id" is the execution_id / call identifier
  id: z.string().min(1, "id is required"),
  agent_id: z.string().nullish(),

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
  to_number: z.string().nullish(),   // customer's phone
  from_number: z.string().nullish(), // Bolna's number

  // Timestamps
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),

  // Duration in seconds — only on completed/failed
  duration: z.number().nullish(),

  // Content — only on completed
  transcript: z.string().nullish(),
  summary: z.string().nullish(),
  recording_url: z.string().nullish(),

  // Function calls made during the call
  tool_calls: z
    .array(
      z.object({
        name: z.string(),
        input: z.record(z.string(), z.unknown()).optional(),
        output: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .nullish(),

  // Post-call extractions (if configured in Analytics Tab)
  extractions: z.record(z.string(), z.string()).nullish(),
})

export type BolnaWebhookPayload = z.infer<typeof BolnaWebhookPayloadSchema>
