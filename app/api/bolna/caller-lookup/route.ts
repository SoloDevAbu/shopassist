import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"

/**
 * GET /api/bolna/caller-lookup
 */
export async function GET(request: Request) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const contactNumber = searchParams.get("contact_number")
  const executionId = searchParams.get("execution_id")

  if (!contactNumber) {
    return NextResponse.json(defaultContext())
  }

  const DEMO_PHONE_MAP: Record<string, object> = {
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
