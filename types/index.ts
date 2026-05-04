// Re-export Prisma enums for convenience
export type { BolnaWebhookPayload } from "../validator/webhook"
export {
  OrderStatus,
  RefundStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  TicketPriority,
  TicketStatus,
  TicketSource,
  TicketCategory,
  CallStatus,
  CallOutcome,
} from "../app/generated/prisma/client"

// Standard API response envelope
export type ApiSuccessResponse<T> = {
  success: true
  data: T
}

export type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
