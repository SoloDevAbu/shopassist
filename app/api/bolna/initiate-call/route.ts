import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { initiateCall } from "@/lib/bolna"

export async function POST(request: Request) {
  let phoneNumber: string | undefined

  try {
    const body = await request.json()
    phoneNumber = body.phoneNumber
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 }
    )
  }

  if (!phoneNumber || !phoneNumber.startsWith("+")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PHONE",
          message: "Phone number must include country code e.g. +919876543210",
        },
      },
      { status: 400 }
    )
  }

  const digits = phoneNumber.slice(1).replace(/\D/g, "")
  if (digits.length < 7 || digits.length > 15) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PHONE",
          message: "Phone number length is invalid",
        },
      },
      { status: 400 }
    )
  }

  try {
    const demoCustomerData = getDemoCustomerData(phoneNumber)

    const { execution_id } = await initiateCall({
      recipientPhone: phoneNumber,
      userData: demoCustomerData,
    })

    await prisma.callLog.create({
      data: {
        callSid: execution_id,
        toNumber: phoneNumber,
        fromNumber: process.env.BOLNA_DEFAULT_FROM_NUMBER ?? "Bolna",
        status: "initiated",
      },
    })

    return NextResponse.json({ success: true, callId: execution_id })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initiate call"
    console.error(
      JSON.stringify({
        level: "error",
        route: "POST /api/bolna/initiate-call",
        message,
      })
    )

    return NextResponse.json(
      { success: false, error: { code: "BOLNA_ERROR", message } },
      { status: 502 }
    )
  }
}

/**
 * Maps known demo phone numbers -> seeded customer data.
 */
function getDemoCustomerData(phone: string): Record<string, string | null> {
  const map: Record<string, Record<string, string | null>> = {
    ...(process.env.DEMO_PHONE_NUMBER
      ? {
          [process.env.DEMO_PHONE_NUMBER]: {
            customer_name: "Alice Sharma",
            account_type: "pro",
            subscription_status: "active",
            recent_order_id: "ORD-00003",
            recent_order_status: "shipped",
          },
        }
      : {}),
  }

  return (
    map[phone] ?? {
      customer_name: "Guest",
      account_type: "none",
      subscription_status: "none",
      recent_order_id: null,
      recent_order_status: null,
    }
  )
}
