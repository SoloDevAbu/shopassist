import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { upsertContext } from "@/lib/call-context"
import { OrderStatusQuerySchema } from "@/validator/order"

/**
 * GET /api/orders/user/status
 *
 * Called by: user to get their order status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = OrderStatusQuerySchema.safeParse(searchParams)

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
        lastIntent: "check_order_status",
      })
    }

    const order = await prisma.order.findUnique({
      where: { orderId: order_id },
    })

    if (order?.customerEmail && call_sid) {
      await upsertContext(call_sid, {
        lastCustomerEmail: order.customerEmail,
      })
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: `No order found with ID ${order_id}. Please verify the order number and try again.`,
          },
        },
        { status: 404 }
      )
    }

    const items = (order.items as { name: string; qty: number }[]).map(
      (item) => ({ name: item.name, qty: item.qty })
    )

    const estimatedDelivery = order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
          month: "long",
          day: "numeric",
        })
      : null

    let message = ""
    switch (order.status) {
      case "processing":
        message = `Your order ${order.orderId} is currently being processed. We'll notify you once it ships.`
        break
      case "shipped":
        message = `Your order ${order.orderId} has been shipped${
          order.trackingNumber
            ? ` and your tracking number is ${order.trackingNumber}`
            : ""
        }${estimatedDelivery ? `. Expected delivery by ${estimatedDelivery}` : ""}.`
        break
      case "delivered":
        message = `Your order ${order.orderId} has been delivered${
          estimatedDelivery ? ` on ${estimatedDelivery}` : ""
        }.`
        break
      case "cancelled":
        message = `Your order ${order.orderId} has been cancelled.`
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        customerName: order.customerName,
        items,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        estimatedDelivery,
        message,
      },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "GET /api/orders/status",
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
