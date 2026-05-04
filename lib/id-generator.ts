import { randomBytes } from "crypto"

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

/**
 * Generates a random, phone-readable ticket ID.
 * Format: TKT-XXXXX (5 uppercase alphanumeric chars)
 * Example: TKT-A7X2Q
 */
export function generateTicketId(): string {
  const bytes = randomBytes(5)
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length]
  }
  return `TKT-${result}`
}

/**
 * Generates a zero-padded order ID for seed data only.
 * Format: ORD-XXXXX (5 zero-padded digits)
 * Example: ORD-00001
 */
export function generateOrderId(num: number): string {
  return `ORD-${String(num).padStart(5, "0")}`
}
