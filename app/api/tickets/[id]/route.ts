import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { UpdateTicketBodySchema } from "@/validator/ticket"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: id }, { ticketId: id }],
      },
      include: {
        order: {
          select: {
            orderId: true,
            status: true,
            totalAmount: true,
            items: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `No ticket found with ID ${id}`,
          },
        },
        { status: 404 }
      )
    }

    let call = null
    if (ticket.callSid) {
      call = await prisma.callLog.findUnique({
        where: { callSid: ticket.callSid },
        select: {
          transcript: true,
          summary: true,
          durationSeconds: true,
          functionsCalled: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { ticket: { ...ticket, call } },
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "GET /api/tickets/[id]",
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateTicketBodySchema.safeParse(body)

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

    const { status } = parsed.data

    const existing = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: id }, { ticketId: id }],
      },
    })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `No ticket found with ID ${id}`,
          },
        },
        { status: 404 }
      )
    }

    const resolvedAt =
      status === "resolved" || status === "closed" ? new Date() : undefined

    const updated = await prisma.supportTicket.update({
      where: { id: existing.id },
      data: { status, ...(resolvedAt ? { resolvedAt } : {}) },
    })

    return NextResponse.json({ success: true, data: { ticket: updated } })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        route: "PATCH /api/tickets/[id]",
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
