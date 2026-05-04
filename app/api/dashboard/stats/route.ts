import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { startOfDay } from "date-fns"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const today = startOfDay(new Date())

    const [openTickets, callsTodayRaw, completedCallsToday, avgDuration] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "open" } }),
      prisma.callLog.count({ where: { createdAt: { gte: today } } }),
      prisma.callLog.findMany({
        where: { 
          createdAt: { gte: today },
          outcome: { in: ["resolved", "escalated"] }
        },
        select: { outcome: true }
      }),
      prisma.callLog.aggregate({
        where: { createdAt: { gte: today } },
        _avg: { durationSeconds: true }
      })
    ])

    const totalValid = completedCallsToday.length
    const resolved = completedCallsToday.filter((c: any) => c.outcome === "resolved").length
    const automationRate = totalValid > 0 ? Math.round((resolved / totalValid) * 100) : 0

    return NextResponse.json({
      data: {
        openTickets,
        callsToday: callsTodayRaw,
        automationRate,
        avgDurationSeconds: Math.round(avgDuration._avg.durationSeconds || 0)
      }
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: { message: "Failed to load stats" } }, { status: 500 })
  }
}
