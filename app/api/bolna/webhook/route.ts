import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { queue } from "@/lib/queue"
import { clearContext } from "@/lib/call-context"
import { classifyOutcome } from "@/lib/outcome-classifier"
import { BolnaWebhookPayloadSchema } from "@/validator/webhook"

export const maxDuration = 30 // Allow up to 30s for DB writes on Vercel

// ── Worker handlers (registered on module load) ─────────────────────────────

queue.process("bolna.scheduled", async (payload) => {
  const p = payload as {
    executionId: string
    toNumber?: string
    fromNumber?: string
    agentId?: string
  }
  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: {
      callSid: p.executionId,
      agentId: p.agentId ?? null,
      toNumber: p.toNumber ?? null,
      fromNumber: p.fromNumber ?? null,
      status: "initiated",
    },
    update: { status: "initiated" },
  })
})

queue.process("bolna.queued", async (payload) => {
  const p = payload as { executionId: string }
  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: { callSid: p.executionId, status: "initiated" },
    update: { status: "initiated" },
  })
})

queue.process("bolna.in-progress", async (payload) => {
  const p = payload as { executionId: string }
  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: { callSid: p.executionId, status: "in_progress" },
    update: { status: "in_progress" },
  })
})

queue.process("bolna.completed", async (payload) => {
  const p = payload as {
    executionId: string
    duration?: number
    transcript?: string
    summary?: string
    toolCallNames?: string[]
    toNumber?: string
    fromNumber?: string
  }

  const functionsCalled = p.toolCallNames ?? []
  const wasTicketCreated = functionsCalled.includes("create_support_ticket")
  const durationSeconds = p.duration ?? 0
  const outcome = classifyOutcome(
    functionsCalled,
    wasTicketCreated,
    durationSeconds
  )

  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: {
      callSid: p.executionId,
      toNumber: p.toNumber ?? null,
      fromNumber: p.fromNumber ?? null,
      status: "completed",
      outcome,
      durationSeconds,
      transcript: p.transcript ?? null,
      summary: p.summary ?? null,
      functionsCalled: functionsCalled as unknown as undefined,
      wasTicketCreated,
    },
    update: {
      status: "completed",
      outcome,
      durationSeconds,
      transcript: p.transcript ?? null,
      summary: p.summary ?? null,
      functionsCalled: functionsCalled as unknown as undefined,
      wasTicketCreated,
      toNumber: p.toNumber ?? undefined,
      fromNumber: p.fromNumber ?? undefined,
    },
  })

  // If any ticket was created during this call, link it to the summary
  if (wasTicketCreated) {
    await prisma.supportTicket.updateMany({
      where: { callSid: p.executionId },
      data: { callSummary: p.summary ?? null },
    })
  }

  await clearContext(p.executionId)
})

queue.process("bolna.failed", async (payload) => {
  const p = payload as { executionId: string }
  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: { callSid: p.executionId, status: "failed", outcome: "failed" },
    update: { status: "failed", outcome: "failed" },
  })
  await clearContext(p.executionId)
})

queue.process("bolna.cancelled", async (payload) => {
  const p = payload as { executionId: string }
  await prisma.callLog.upsert({
    where: { callSid: p.executionId },
    create: { callSid: p.executionId, status: "failed", outcome: "failed" },
    update: { status: "failed", outcome: "failed" },
  })
  await clearContext(p.executionId)
})

// ── POST /api/bolna/webhook ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { received: false, error: "Invalid JSON" },
      { status: 400 }
    )
  }

  const parsed = BolnaWebhookPayloadSchema.safeParse(body)
  if (!parsed.success) {
    // Log but return 200 so Bolna doesn't retry indefinitely
    console.error(
      JSON.stringify({
        level: "warn",
        route: "POST /api/bolna/webhook",
        message: "Webhook payload did not match expected schema — ignoring",
        issues: parsed.error.issues,
        rawBody: body,
      })
    )
    return NextResponse.json({ received: true, parsed: false })
  }

  const {
    id,
    status,
    to_number,
    from_number,
    duration,
    transcript,
    summary,
    tool_calls,
    extractions,
    agent_id,
  } = parsed.data

  // Idempotency key: composite id::status — Bolna sends one event per status change
  const eventId = `${id}::${status}`

  try {
    await prisma.webhookEvent.create({
      data: { eventId, eventType: status, payload: body as object },
    })
  } catch (e: any) {
    if (e.code === "P2002") {
      // Already processed — safe to acknowledge
      return NextResponse.json({ received: true, duplicate: true })
    }
    throw e
  }

  // Extract function names from Bolna's tool_calls array
  const toolCallNames = (tool_calls ?? []).map((t) => t.name)

  // Enqueue processing job (non-blocking) — ACK to Bolna immediately
  const jobType = `bolna.${status}` as const

  await queue.enqueue({
    type: jobType,
    payload: {
      executionId: id,
      agentId: agent_id,
      toNumber: to_number,
      fromNumber: from_number,
      duration,
      transcript,
      summary,
      toolCallNames,
      extractions,
    },
  })

  return NextResponse.json({ received: true })
}
