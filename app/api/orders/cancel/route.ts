import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"
import { upsertContext, getContext } from "@/lib/call-context"
import { CancelOrderBodySchema } from "@/validator/order"

/**
 * POST /api/orders/cancel
 *
 * Called by: Bolna agent after customer confirms cancellation.
 * Auth: Bearer AGENT_SECRET_KEY
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const parsed = CancelOrderBodySchema.safeParse(body)

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

    let { order_id, customer_email, call_sid } = parsed.data

    if (!order_id && call_sid) {
      const ctx = await getContext(call_sid)
      if (ctx?.lastOrderId) {
        order_id = ctx.lastOrderId
      }
    }

    customer_email = customer_email.trim().toLowerCase()

    if (!customer_email && call_sid) {
      const ctx = await getContext(call_sid)
      if (ctx?.lastCustomerEmail) {
        customer_email = (ctx.lastCustomerEmail as string).toLowerCase()
      }
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

    if (order.customerEmail.toLowerCase().trim() !== customer_email) {
      let contextEmail: string | null = null
      if (call_sid) {
        const ctx = await getContext(call_sid)
        contextEmail = ctx?.lastCustomerEmail
          ? (ctx.lastCustomerEmail as string).toLowerCase().trim()
          : null
      }

      if (
        !contextEmail ||
        order.customerEmail.toLowerCase().trim() !== contextEmail
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EMAIL_MISMATCH",
              message:
                "The email address provided does not match our records for this order. Please verify the email address.",
            },
          },
          { status: 403 }
        )
      }
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CANNOT_CANCEL_SHIPPED",
            message: `This order has already been ${order.status} and cannot be cancelled. Please contact support for return options.`,
          },
        },
        { status: 409 }
      )
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_CANCELLED",
            message: `Order ${order.orderId} was already cancelled.`,
          },
        },
        { status: 409 }
      )
    }

    const [updatedOrder, refund] = await prisma.$transaction([
      prisma.order.update({
        where: { orderId: order_id },
        data: { status: "cancelled" },
      }),
      prisma.refund.create({
        data: {
          orderId: order_id,
          amount: order.totalAmount,
          status: "pending",
          reason: "Customer requested cancellation via voice agent",
        },
      }),
    ])

    if (call_sid) {
      await upsertContext(call_sid, {
        lastOrderId: order_id,
        lastIntent: "cancel_order",
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.orderId,
        newStatus: "cancelled",
        refundAmount: refund.amount,
        refundStatus: "pending",
        message: `Your order ${updatedOrder.orderId} has been cancelled. A refund of ₹${refund.amount.toLocaleString("en-IN")} will be processed within 5-7 business days.`,
      },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "POST /api/orders/cancel",
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
