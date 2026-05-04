import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  SEED_ORDERS,
  SEED_REFUNDS,
  SEED_SUBSCRIPTIONS,
  SEED_TICKETS,
  SEED_CALL_LOGS,
} from "../lib/mock-data"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Orders
  for (const order of SEED_ORDERS) {
    await prisma.order.upsert({
      where: { orderId: order.orderId },
      create: {
        orderId: order.orderId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      },
      update: {},
    })
  }
  console.log(`  ✓ ${SEED_ORDERS.length} orders`)

  // Refunds
  for (const refund of SEED_REFUNDS) {
    await prisma.refund.upsert({
      where: { orderId: refund.orderId },
      create: {
        orderId: refund.orderId,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
        initiatedAt: refund.initiatedAt,
        completedAt: refund.completedAt,
      },
      update: {},
    })
  }
  console.log(`  ✓ ${SEED_REFUNDS.length} refunds`)

  // Subscriptions
  for (const sub of SEED_SUBSCRIPTIONS) {
    await prisma.subscription.upsert({
      where: { customerEmail: sub.customerEmail },
      create: {
        customerEmail: sub.customerEmail,
        customerName: sub.customerName,
        plan: sub.plan,
        status: sub.status,
        billingCycle: sub.billingCycle,
        nextBillingDate: sub.nextBillingDate,
        cancelledAt: sub.cancelledAt,
        cancelReason: sub.cancelReason,
      },
      update: {},
    })
  }
  console.log(`  ✓ ${SEED_SUBSCRIPTIONS.length} subscriptions`)

  // Call Logs (before tickets, since tickets reference callSid)
  for (const log of SEED_CALL_LOGS) {
    await prisma.callLog.upsert({
      where: { callSid: log.callSid },
      create: {
        callSid: log.callSid,
        agentId: log.agentId,
        fromNumber: log.fromNumber,
        toNumber: log.toNumber,
        status: log.status,
        outcome: log.outcome,
        durationSeconds: log.durationSeconds,
        transcript: log.transcript,
        summary: log.summary,
        functionsCalled: log.functionsCalled as unknown as undefined,
        wasTicketCreated: log.wasTicketCreated,
      },
      update: {},
    })
  }
  console.log(`  ✓ ${SEED_CALL_LOGS.length} call logs`)

  // Support Tickets
  for (const ticket of SEED_TICKETS) {
    await prisma.supportTicket.upsert({
      where: { ticketId: ticket.ticketId },
      create: {
        ticketId: ticket.ticketId,
        callerPhone: ticket.callerPhone,
        customerEmail: ticket.customerEmail,
        category: ticket.category,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        source: ticket.source,
        callSid: ticket.callSid,
        orderId: ticket.orderId,
        resolvedAt: ticket.resolvedAt,
      },
      update: {},
    })
  }
  console.log(`  ✓ ${SEED_TICKETS.length} support tickets`)

  console.log("✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
