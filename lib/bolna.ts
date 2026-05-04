/**
 * Bolna API client wrapper.
 * All calls to api.bolna.ai go through here — one place to fix if the API changes.
 * Server-only module — never import from client components.
 */

const BOLNA_API_BASE = "https://api.bolna.ai"

function bolnaHeaders() {
  return {
    Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
    "Content-Type": "application/json",
  }
}

export interface InitiateCallOptions {
  /** Recipient phone in E.164 format e.g. +919876543210 */
  recipientPhone: string
  /**
   * Optional user_data injected into the agent's prompt as template variables.
   * Keys must match {{variable_name}} placeholders in your Bolna agent prompt.
   */
  userData?: Record<string, string | number | null>
  /** Optional: override agent's voice for this call */
  voiceId?: string
}

export interface InitiateCallResponse {
  /** Bolna's unique execution identifier — store as callSid */
  execution_id: string
  status: "queued"
  message: string
}

/**
 * Trigger an outbound call via Bolna.
 * Returns the execution_id which is used to correlate webhook events.
 */
export async function initiateCall(options: InitiateCallOptions): Promise<InitiateCallResponse> {
  const body: Record<string, unknown> = {
    agent_id: process.env.BOLNA_AGENT_ID,
    recipient_phone_number: options.recipientPhone,
  }

  if (options.userData) body.user_data = options.userData
  if (options.voiceId) body.agent_data = { voice_id: options.voiceId }

  const res = await fetch(`${BOLNA_API_BASE}/call`, {
    method: "POST",
    headers: bolnaHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = "Bolna call initiation failed"
    try {
      const err = await res.json()
      message = err.message ?? message
    } catch {}
    throw new Error(`[Bolna ${res.status}] ${message}`)
  }

  return res.json()
}

/**
 * Fetch the current state of a call execution.
 * Useful for polling after initiation before the webhook fires.
 */
export async function getCallExecution(executionId: string) {
  const res = await fetch(`${BOLNA_API_BASE}/executions/${executionId}`, {
    headers: bolnaHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch execution ${executionId}`)
  return res.json()
}
