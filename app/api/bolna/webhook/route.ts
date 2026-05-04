import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"
import { queue } from "../../../../lib/queue"
import { upsertContext, clearContext } from "../../../../lib/call-context"
import { classifyOutcome } from "../../../../lib/outcome-classifier"
import { BolnaWebhookPayloadSchema } from "../../../../validator/webhook"

export const maxDuration = 30 // seconds — webhook handler needs longer than default 10s

// Register job handlers on module load
queue.process("webhook.call.initiated", async (payload) => {
  const { call_sid, agent_id, from_number, to_number } = payload as {
    call_sid: string; agent_id?: string; from_number?: string; to_number?: string
  }
  await prisma.callLog.create({
    data: { callSid: call_sid, agentId: agent_id ?? null, fromNumber: from_number ?? null, toNumber: to_number ?? null, status: "initiated" },
  })
  await upsertContext(call_sid, {})
})

queue.process("webhook.call.in_progress", async (payload) => {
  const { call_sid } = payload as { call_sid: string }
  await prisma.callLog.update({ where: { callSid: call_sid }, data: { status: "in_progress" } })
})

queue.process("webhook.call.completed", async (payload) => {
  const p = payload as {
    call_sid: string; duration_seconds?: number; transcript?: string
    summary?: string; functions_called?: string[]
  }
  const callLog = await prisma.callLog.findUnique({ where: { callSid: p.call_sid } })
  const functionsCalled = p.functions_called ?? []
  const wasTicketCreated = callLog?.wasTicketCreated ?? false
  const durationSeconds = p.duration_seconds ?? 0
  const outcome = classifyOutcome(functionsCalled, wasTicketCreated, durationSeconds)

  await prisma.callLog.update({
    where: { callSid: p.call_sid },
    data: {
      status: "completed",
      durationSeconds,
      transcript: p.transcript ?? null,
      summary: p.summary ?? null,
      functionsCalled: functionsCalled as unknown as undefined,
      outcome,
    },
  })
  await clearContext(p.call_sid)
})

queue.process("webhook.call.failed", async (payload) => {
  const { call_sid } = payload as { call_sid: string }
  await prisma.callLog.update({
    where: { callSid: call_sid },
    data: { status: "failed", outcome: "failed" },
  })
  await clearContext(call_sid)
})

// POST /api/bolna/webhook — All Bolna call lifecycle events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BolnaWebhookPayloadSchema.safeParse(body)

    if (!parsed.success) {
      console.error(JSON.stringify({ level: "error", route: "POST /api/bolna/webhook", message: "Invalid webhook payload", details: parsed.error.issues, rawPayload: body, timestamp: new Date().toISOString() }))
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Invalid webhook payload" } }, { status: 400 })
    }

    const { event_id, event_type, call_sid, agent_id, from_number, to_number, duration_seconds, transcript, summary, functions_called } = parsed.data

    // Idempotency check
    const existing = await prisma.webhookEvent.findUnique({ where: { eventId: event_id } })
    if (existing) {
      return NextResponse.json({ received: true, deduplicated: true })
    }

    // Record webhook event
    await prisma.webhookEvent.create({
      data: { eventId: event_id, eventType: event_type, payload: body },
    })

    // Enqueue job (non-blocking) and return 200 immediately
    const jobType = `webhook.${event_type}`
    await queue.enqueue({
      type: jobType,
      payload: { call_sid, agent_id, from_number, to_number, duration_seconds, transcript, summary, functions_called },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(JSON.stringify({ level: "error", route: "POST /api/bolna/webhook", message: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() }))
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 })
  }
}
