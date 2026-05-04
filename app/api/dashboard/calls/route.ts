import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const calls = await prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Map toNumber → callerPhone for dashboard display consistency
    // (the DB stores toNumber; dashboard components expect callerPhone)
    const mapped = calls.map((c) => ({
      ...c,
      callerPhone: c.toNumber ?? null,
    }))

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error("Calls API error:", error)
    return NextResponse.json({ error: { message: "Failed to fetch calls" } }, { status: 500 })
  }
}
