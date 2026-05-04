import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const calls = await prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json({ data: calls })
  } catch (error) {
    console.error("Calls API error:", error)
    return NextResponse.json({ error: { message: "Failed to fetch calls" } }, { status: 500 })
  }
}
