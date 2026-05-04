/**
 * Canonical seed data constants.
 * Used by prisma/seed.ts and test helpers — single source of truth.
 */

export const SEED_ORDERS = [
  {
    orderId: "ORD-00001",
    customerEmail: "alice@example.com",
    customerName: "Alice Johnson",
    status: "processing" as const,
    items: [{ name: "Wireless Earbuds", qty: 1, price: 1200 }],
    totalAmount: 1200,
    trackingNumber: null,
    estimatedDelivery: null,
  },
  {
    orderId: "ORD-00002",
    customerEmail: "bob@example.com",
    customerName: "Bob Smith",
    status: "processing" as const,
    items: [
      { name: "Smart Watch Pro", qty: 1, price: 5500 },
      { name: "Watch Band Premium", qty: 1, price: 1000 },
    ],
    totalAmount: 6500,
    trackingNumber: null,
    estimatedDelivery: null,
  },
  {
    orderId: "ORD-00003",
    customerEmail: "carol@example.com",
    customerName: "Carol Williams",
    status: "shipped" as const,
    items: [{ name: "Phone Case Ultra", qty: 2, price: 425 }],
    totalAmount: 850,
    trackingNumber: "TRK-99281",
    estimatedDelivery: new Date("2026-05-10"),
  },
  {
    orderId: "ORD-00004",
    customerEmail: "dave@example.com",
    customerName: "Dave Brown",
    status: "shipped" as const,
    items: [
      { name: "Bluetooth Speaker", qty: 1, price: 2400 },
      { name: "USB-C Cable 3-Pack", qty: 1, price: 1000 },
    ],
    totalAmount: 3400,
    trackingNumber: "TRK-77543",
    estimatedDelivery: new Date("2026-05-12"),
  },
  {
    orderId: "ORD-00005",
    customerEmail: "eve@example.com",
    customerName: "Eve Davis",
    status: "delivered" as const,
    items: [{ name: "Laptop Stand Ergonomic", qty: 1, price: 2100 }],
    totalAmount: 2100,
    trackingNumber: "TRK-55128",
    estimatedDelivery: new Date("2026-04-28"),
  },
  {
    orderId: "ORD-00006",
    customerEmail: "alice@example.com",
    customerName: "Alice Johnson",
    status: "delivered" as const,
    items: [
      { name: "4K Monitor 27-inch", qty: 1, price: 8999 },
      { name: "Monitor Arm", qty: 1, price: 1000 },
    ],
    totalAmount: 9999,
    trackingNumber: "TRK-33891",
    estimatedDelivery: new Date("2026-04-25"),
  },
  {
    orderId: "ORD-00007",
    customerEmail: "bob@example.com",
    customerName: "Bob Smith",
    status: "delivered" as const,
    items: [{ name: "Webcam HD", qty: 1, price: 450 }],
    totalAmount: 450,
    trackingNumber: "TRK-11456",
    estimatedDelivery: new Date("2026-04-20"),
  },
  {
    orderId: "ORD-00008",
    customerEmail: "carol@example.com",
    customerName: "Carol Williams",
    status: "cancelled" as const,
    items: [{ name: "Mechanical Keyboard", qty: 1, price: 1800 }],
    totalAmount: 1800,
    trackingNumber: null,
    estimatedDelivery: null,
  },
  {
    orderId: "ORD-00009",
    customerEmail: "dave@example.com",
    customerName: "Dave Brown",
    status: "cancelled" as const,
    items: [{ name: "Gaming Mouse", qty: 1, price: 5200 }],
    totalAmount: 5200,
    trackingNumber: null,
    estimatedDelivery: null,
  },
  {
    orderId: "ORD-00010",
    customerEmail: "eve@example.com",
    customerName: "Eve Davis",
    status: "processing" as const,
    items: [{ name: "USB Hub 7-Port", qty: 1, price: 320 }],
    totalAmount: 320,
    trackingNumber: null,
    estimatedDelivery: null,
  },
] as const

// ── Refunds ─────────────────────────────────────────────────────────

export const SEED_REFUNDS = [
  {
    orderId: "ORD-00009",
    amount: 5200,
    status: "completed" as const,
    reason: "Customer requested cancellation",
    initiatedAt: new Date("2026-04-15"),
    completedAt: new Date("2026-04-20"),
  },
  {
    orderId: "ORD-00008",
    amount: 1800,
    status: "processing" as const,
    reason: "Order cancelled before shipment",
    initiatedAt: new Date("2026-04-28"),
    completedAt: null,
  },
  {
    orderId: "ORD-00006",
    amount: 9999,
    status: "pending" as const,
    reason: "Customer claims item not received despite delivery status",
    initiatedAt: new Date("2026-05-01"),
    completedAt: null,
  },
] as const

// ── Subscriptions ───────────────────────────────────────────────────

export const SEED_SUBSCRIPTIONS = [
  {
    customerEmail: "alice@example.com",
    customerName: "Alice Johnson",
    plan: "pro" as const,
    status: "active" as const,
    billingCycle: "monthly",
    nextBillingDate: new Date("2026-06-01"),
    cancelledAt: null,
    cancelReason: null,
  },
  {
    customerEmail: "bob@example.com",
    customerName: "Bob Smith",
    plan: "basic" as const,
    status: "active" as const,
    billingCycle: "monthly",
    nextBillingDate: new Date("2026-06-01"),
    cancelledAt: null,
    cancelReason: null,
  },
  {
    customerEmail: "carol@example.com",
    customerName: "Carol Williams",
    plan: "enterprise" as const,
    status: "active" as const,
    billingCycle: "yearly",
    nextBillingDate: new Date("2027-01-01"),
    cancelledAt: null,
    cancelReason: null,
  },
  {
    customerEmail: "dave@example.com",
    customerName: "Dave Brown",
    plan: "pro" as const,
    status: "paused" as const,
    billingCycle: "monthly",
    nextBillingDate: null,
    cancelledAt: null,
    cancelReason: null,
  },
  {
    customerEmail: "eve@example.com",
    customerName: "Eve Davis",
    plan: "basic" as const,
    status: "cancelled" as const,
    billingCycle: "monthly",
    nextBillingDate: null,
    cancelledAt: new Date("2026-04-01"),
    cancelReason: "Too expensive",
  },
] as const

// ── Support Tickets ─────────────────────────────────────────────────

export const SEED_TICKETS = [
  {
    ticketId: "TKT-SEED1",
    callerPhone: "+91-9876543210",
    customerEmail: "alice@example.com",
    category: "order" as const,
    description: "Customer asked about delivery timeline for ORD-00003",
    priority: "low" as const,
    status: "resolved" as const,
    source: "voice_agent" as const,
    callSid: "CALL-SEED-001",
    orderId: "ORD-00003",
    resolvedAt: new Date("2026-04-29"),
  },
  {
    ticketId: "TKT-SEED2",
    callerPhone: "+91-9876543211",
    customerEmail: "bob@example.com",
    category: "refund" as const,
    description: "Customer claims charged twice for order ORD-00007",
    priority: "high" as const,
    status: "open" as const,
    source: "voice_agent" as const,
    callSid: "CALL-SEED-002",
    orderId: "ORD-00007",
    resolvedAt: null,
  },
  {
    ticketId: "TKT-SEED3",
    callerPhone: null,
    customerEmail: "carol@example.com",
    category: "subscription" as const,
    description: "Wants to downgrade enterprise plan to pro",
    priority: "medium" as const,
    status: "in_progress" as const,
    source: "web_portal" as const,
    callSid: null,
    orderId: null,
    resolvedAt: null,
  },
  {
    ticketId: "TKT-SEED4",
    callerPhone: "+91-9876543212",
    customerEmail: "dave@example.com",
    category: "shipping" as const,
    description: "Package shows delivered but customer says not received",
    priority: "high" as const,
    status: "open" as const,
    source: "voice_agent" as const,
    callSid: "CALL-SEED-003",
    orderId: "ORD-00005",
    resolvedAt: null,
  },
  {
    ticketId: "TKT-SEED5",
    callerPhone: null,
    customerEmail: "eve@example.com",
    category: "product" as const,
    description: "USB Hub stopped working after two weeks",
    priority: "medium" as const,
    status: "open" as const,
    source: "web_portal" as const,
    callSid: null,
    orderId: "ORD-00010",
    resolvedAt: null,
  },
] as const

// ── Call Logs ────────────────────────────────────────────────────────

export const SEED_CALL_LOGS = [
  {
    callSid: "CALL-SEED-001",
    agentId: "agent-shopassist-v1",
    fromNumber: "+91-9876543210",
    toNumber: "+91-1800-SHOP",
    status: "completed" as const,
    outcome: "resolved" as const,
    durationSeconds: 120,
    transcript:
      "Customer: Hi, where is my order ORD-00003?\nAgent: Your order has been shipped and is expected by May 10th. Tracking number TRK-99281.\nCustomer: Great, thanks!",
    summary:
      "Customer inquired about order status. Order shipped, ETA May 10th.",
    functionsCalled: ["check_order_status"],
    wasTicketCreated: true,
  },
  {
    callSid: "CALL-SEED-002",
    agentId: "agent-shopassist-v1",
    fromNumber: "+91-9876543211",
    toNumber: "+91-1800-SHOP",
    status: "completed" as const,
    outcome: "escalated" as const,
    durationSeconds: 180,
    transcript:
      "Customer: I was charged twice for my webcam order!\nAgent: I see your order ORD-00007. Let me create a support ticket for the billing team.\nCustomer: Yes, please do.",
    summary:
      "Customer reported double charge. Ticket created for billing investigation.",
    functionsCalled: ["check_order_status", "create_support_ticket"],
    wasTicketCreated: true,
  },
  {
    callSid: "CALL-SEED-003",
    agentId: "agent-shopassist-v1",
    fromNumber: "+91-9876543212",
    toNumber: "+91-1800-SHOP",
    status: "failed" as const,
    outcome: "failed" as const,
    durationSeconds: 8,
    transcript: "Customer: Hello?\n[call disconnected]",
    summary: "Call dropped before agent could engage.",
    functionsCalled: [],
    wasTicketCreated: false,
  },
] as const

// ── Email constants ─────────────────────────────────────────────────

export const SEED_EMAILS = {
  alice: "alice@example.com",
  bob: "bob@example.com",
  carol: "carol@example.com",
  dave: "dave@example.com",
  eve: "eve@example.com",
} as const
