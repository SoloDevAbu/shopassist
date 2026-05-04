import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"

/**
 * GET /api/bolna/caller-lookup
 *
 * Called by Bolna automatically when the agent connects (Inbound Tab → API Data Source).
 * Bolna passes these query params:
 *   ?contact_number=+919876543210&agent_id=<uuid>&execution_id=<uuid>
 *
 * Returns JSON that Bolna injects into the agent's active prompt as context variables.
 * Keys must match {{variable_name}} placeholders in your Bolna agent prompt.
 */
export async function GET(request: Request) {
  // Bolna sends AGENT_SECRET_KEY as Bearer token
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const contactNumber = searchParams.get("contact_number")
  const executionId = searchParams.get("execution_id")

  // Always return valid JSON — never block the call
  if (!contactNumber) {
    return NextResponse.json(defaultContext())
  }

  // ── Demo phone map ──────────────────────────────────────────────────────────
  // Map your test phone number → seed data for the demo recording
  const DEMO_PHONE_MAP: Record<string, object> = {
    // Add your own number here: "+919XXXXXXXXX"
    ...(process.env.DEMO_PHONE_NUMBER
      ? {
          [process.env.DEMO_PHONE_NUMBER]: {
            customer_name: "Alice Sharma",
            account_type: "pro",
            subscription_status: "active",
            recent_order_id: "ORD-00003",
            recent_order_status: "shipped",
            caller_phone: process.env.DEMO_PHONE_NUMBER,
          },
        }
      : {}),
  }

  if (DEMO_PHONE_MAP[contactNumber]) {
    return NextResponse.json(DEMO_PHONE_MAP[contactNumber])
  }

  // ── Production path: look up by phone number ────────────────────────────────
  // In production, your customers would have phone numbers stored in the DB
  // For now, return generic guest context — the call still proceeds normally
  try {
    const [activeSubscription, recentOrder] = await Promise.all([
      prisma.subscription.findFirst({
        where: { status: { in: ["active", "paused"] } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findFirst({
        where: { status: { in: ["processing", "shipped"] } },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({
      customer_name: "Guest",
      account_type: activeSubscription?.plan ?? "none",
      subscription_status: activeSubscription?.status ?? "none",
      recent_order_id: recentOrder?.orderId ?? null,
      recent_order_status: recentOrder?.status ?? null,
      caller_phone: contactNumber,
    })
  } catch (error) {
    console.error("caller-lookup DB error:", error)
    return NextResponse.json(defaultContext(contactNumber))
  }
}

function defaultContext(callerPhone?: string) {
  return {
    customer_name: "Guest",
    account_type: "none",
    subscription_status: "none",
    recent_order_id: null,
    recent_order_status: null,
    caller_phone: callerPhone ?? null,
  }
}
