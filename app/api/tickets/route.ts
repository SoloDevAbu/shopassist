import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAgentSecret } from "@/lib/auth"
import { upsertContext } from "@/lib/call-context"
import { generateTicketId } from "@/lib/id-generator"
import { inferPriority } from "@/lib/priority-engine"
import {
  CreateTicketBodySchema,
  ListTicketsQuerySchema,
} from "../../../validator/ticket"
import type { TicketPriority } from "../../../types"

// POST /api/tickets — Create ticket (voice agent or web portal)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateTicketBodySchema.safeParse(body)
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

    const data = parsed.data
    const source = data.source ?? "voice_agent"

    if (source === "voice_agent" && !verifyAgentSecret(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid agent secret" },
        },
        { status: 401 }
      )
    }

    // Priority engine
    let order = null
    let subscription = null
    if (data.orderId) {
      order = await prisma.order.findUnique({
        where: { orderId: data.orderId },
      })
    }
    if (data.customerEmail) {
      subscription = await prisma.subscription.findUnique({
        where: { customerEmail: data.customerEmail.toLowerCase() },
      })
    }

    const inferredPriority = inferPriority(
      data.description,
      order,
      subscription
    )
    const RANK: Record<TicketPriority, number> = { low: 0, medium: 1, high: 2 }
    const RANK_TO_P: TicketPriority[] = ["low", "medium", "high"]
    const finalPriority =
      RANK_TO_P[Math.max(RANK[data.priority ?? "low"], RANK[inferredPriority])]

    const ticketId = generateTicketId()
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketId,
        callerPhone: data.callerPhone ?? null,
        customerEmail: data.customerEmail ?? null,
        category: data.category,
        description: data.description,
        priority: finalPriority,
        status: "open",
        source,
        callSid: data.callSid ?? null,
        orderId: data.orderId ?? null,
      },
    })

    if (data.callSid) {
      await upsertContext(data.callSid, { lastIntent: "create_support_ticket" })
      try {
        await prisma.callLog.update({
          where: { callSid: data.callSid },
          data: { wasTicketCreated: true },
        })
      } catch {
        /* CallLog may not exist yet */
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ticketId: ticket.ticketId,
          priority: ticket.priority,
          status: "open",
          message: `I've created support ticket ${ticket.ticketId} for you. Our team will contact you within 24 hours.`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "POST /api/tickets",
        message: error instanceof Error ? error.message : String(error),
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

// GET /api/tickets — List with filters + pagination (dashboard)
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = ListTicketsQuerySchema.safeParse(searchParams)
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

    const { status, priority, category, source, page, limit } = parsed.data
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (source) where.source = source

    const skip = (page - 1) * limit
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "GET /api/tickets",
        message: error instanceof Error ? error.message : String(error),
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
