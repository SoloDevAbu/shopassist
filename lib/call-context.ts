import prisma from "./prisma"

/**
 * Agent memory — ephemeral per-call context.
 *
 * Stores minimum state needed to resolve forward references
 * (e.g., "cancel that order" without re-asking for order ID).
 *
 * Lifecycle:
 *   call.initiated  → create empty row
 *   function calls  → upsert with latest values
 *   call.completed  → clearContext (row deleted)
 *   call.failed     → clearContext
 */

// ── Read ────────────────────────────────────────────────────────────

export async function getContext(callSid: string) {
  return prisma.callContext.findUnique({
    where: { callSid },
  })
}

// ── Create or Update ────────────────────────────────────────────────

export async function upsertContext(
  callSid: string,
  update: Partial<{
    lastOrderId: string
    lastIntent: string
    lastCustomerEmail: string
  }>
): Promise<void> {
  await prisma.callContext.upsert({
    where: { callSid },
    create: {
      callSid,
      ...update,
    },
    update,
  })
}

// ── Delete (call ended) ─────────────────────────────────────────────

export async function clearContext(callSid: string): Promise<void> {
  try {
    await prisma.callContext.delete({
      where: { callSid },
    })
  } catch {
    // Row may not exist (e.g., call.failed before context was created)
    // This is expected and safe to ignore.
  }
}
