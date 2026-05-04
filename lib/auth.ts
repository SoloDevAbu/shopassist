import { timingSafeEqual } from "crypto"

/**
 * Verifies the agent secret from the Authorization header.
 * Uses timingSafeEqual to prevent timing attacks.
 * Returns false (not throws) so routes control the response shape.
 */
export function verifyAgentSecret(request: Request): boolean {
  const header = request.headers.get("Authorization")
  if (!header?.startsWith("Bearer ")) return false

  const provided = Buffer.from(header.slice(7))
  const expected = Buffer.from(process.env.AGENT_SECRET_KEY!)

  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}
