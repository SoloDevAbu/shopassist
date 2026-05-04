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
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } },
      { status: 400 }
    )
  }

  // Validate — must include country code in E.164 format
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

  // Strip non-digits after the + to validate length (E.164 = 10–15 digits)
  const digits = phoneNumber.slice(1).replace(/\D/g, "")
  if (digits.length < 7 || digits.length > 15) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_PHONE", message: "Phone number length is invalid" } },
      { status: 400 }
    )
  }

  try {
    // Look up any existing customer data to inject as user_data
    // For the demo we use a phone map; in production query your DB by phone
    const demoCustomerData = getDemoCustomerData(phoneNumber)

    // user_data is injected into the Bolna agent's prompt as template variables
    // This is the "wow feature" — agent greets the caller by name
    const { execution_id } = await initiateCall({
      recipientPhone: phoneNumber,
      userData: demoCustomerData,
    })

    // Pre-create CallLog row so the dashboard shows it immediately
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
    const message = error instanceof Error ? error.message : "Failed to initiate call"
    console.error(JSON.stringify({ level: "error", route: "POST /api/bolna/initiate-call", message }))

    return NextResponse.json(
      { success: false, error: { code: "BOLNA_ERROR", message } },
      { status: 502 }
    )
  }
}

/**
 * Maps known demo phone numbers → seeded customer data.
 * Bolna injects this as {{customer_name}}, {{account_type}} etc. in the prompt.
 * Add your own phone number here for the demo recording.
 */
function getDemoCustomerData(phone: string): Record<string, string | null> {
  const map: Record<string, Record<string, string | null>> = {
    // ← Add your phone number here for the demo: "+919XXXXXXXXX"
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
