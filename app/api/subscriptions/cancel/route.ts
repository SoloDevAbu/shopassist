import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"
import { upsertContext } from "@/lib/call-context"
import { CancelSubscriptionBodySchema } from "@/validator/subscription"

export async function POST(request: NextRequest) {
  try {
    // 1. Verify agent secret
    if (!verifyAgentSecret(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid agent secret" },
        },
        { status: 401 }
      )
    }

    // 2. Validate body
    const body = await request.json()
    const parsed = CancelSubscriptionBodySchema.safeParse(body)

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

    const { customer_email, reason, call_sid } = parsed.data

    // 3. Query subscription
    const subscription = await prisma.subscription.findUnique({
      where: { customerEmail: customer_email.toLowerCase() },
    })

    // 4. Not found
    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_SUBSCRIPTION_FOUND",
            message: `No subscription found for ${customer_email}. Please verify the email address.`,
          },
        },
        { status: 404 }
      )
    }

    // 5. Already cancelled
    if (subscription.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_CANCELLED",
            message: `The subscription for ${customer_email} was already cancelled${
              subscription.cancelledAt
                ? ` on ${subscription.cancelledAt.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : ""
            }.`,
          },
        },
        { status: 409 }
      )
    }

    // 6. Cancel subscription
    const previousStatus = subscription.status
    const cancelledAt = new Date()

    const updated = await prisma.subscription.update({
      where: { customerEmail: customer_email.toLowerCase() },
      data: {
        status: "cancelled",
        cancelledAt,
        cancelReason:
          reason ?? "Customer requested cancellation via voice agent",
      },
    })

    // 7. Context upsert
    if (call_sid) {
      await upsertContext(call_sid, {
        lastCustomerEmail: customer_email,
        lastIntent: "cancel_subscription",
      })
    }

    // 8. Return confirmation
    const planName =
      updated.plan.charAt(0).toUpperCase() + updated.plan.slice(1)

    return NextResponse.json({
      success: true,
      data: {
        customerEmail: updated.customerEmail,
        plan: updated.plan,
        previousStatus,
        cancelledAt: cancelledAt.toLocaleDateString("en-IN", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        message: `Your ${planName} plan subscription has been cancelled. You'll retain access until the end of your current billing period.`,
      },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "POST /api/subscriptions/cancel",
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
