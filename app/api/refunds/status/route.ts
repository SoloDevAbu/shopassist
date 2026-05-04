import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"
import { upsertContext } from "@/lib/call-context"
import { RefundStatusQuerySchema } from "@/validator/order"

/**
 * GET /api/refunds/status
 *
 * Called by: Bolna agent when customer asks "What's my refund status?"
 * Auth: Bearer AGENT_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyAgentSecret(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid agent secret" },
        },
        { status: 401 }
      )
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = RefundStatusQuerySchema.safeParse(searchParams)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Validation failed",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { order_id, call_sid } = parsed.data

    if (call_sid) {
      await upsertContext(call_sid, {
        lastOrderId: order_id,
        lastIntent: "check_refund_status",
      })
    }

    const order = await prisma.order.findUnique({
      where: { orderId: order_id },
    })

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: `No order found with ID ${order_id}. Please verify the order number.`,
          },
        },
        { status: 404 }
      )
    }

    const refund = await prisma.refund.findUnique({
      where: { orderId: order_id },
    })

    if (!refund) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_REFUND_ON_FILE",
            message: `There is no refund on file for order ${order_id}. If you believe this is an error, I can create a support ticket for you.`,
          },
        },
        { status: 404 }
      )
    }

    const initiatedAt = refund.initiatedAt.toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const completedAt = refund.completedAt
      ? refund.completedAt.toLocaleDateString("en-IN", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null

    let message = ""
    switch (refund.status) {
      case "pending":
        message = `Your refund of ₹${refund.amount.toLocaleString("en-IN")} for order ${order_id} is pending. It was initiated on ${initiatedAt} and should be processed within 5-7 business days.`
        break
      case "processing":
        message = `Your refund of ₹${refund.amount.toLocaleString("en-IN")} for order ${order_id} is currently being processed. It was initiated on ${initiatedAt}.`
        break
      case "completed":
        message = `Your refund of ₹${refund.amount.toLocaleString("en-IN")} for order ${order_id} has been completed${completedAt ? ` on ${completedAt}` : ""}. The amount should reflect in your account.`
        break
      case "rejected":
        message = `Your refund request for order ${order_id} was rejected. Please contact our support team for more details.`
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order_id,
        refundStatus: refund.status,
        amount: refund.amount,
        initiatedAt,
        completedAt,
        message,
      },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "GET /api/refunds/status",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      })
    )

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    )
  }
}
