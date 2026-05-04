/**
 * Queue abstraction — structural pattern for async job processing.
 *
 * Current implementation: in-memory with setImmediate.
 * Production swap: BullMQ + Redis (same interface, one file change).
 */

// ── Types ───────────────────────────────────────────────────────────

export interface Job {
  type: string
  payload: Record<string, unknown>
}

type JobHandler = (payload: Job["payload"]) => Promise<void>

export interface Queue {
  enqueue(job: Job): Promise<void>
  process(type: string, handler: JobHandler): void
}

// ── In-Memory Implementation ────────────────────────────────────────

class InMemoryQueue implements Queue {
  private handlers = new Map<string, JobHandler>()

  async enqueue(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type)
    if (!handler) {
      console.warn(`[queue] No handler registered for job type: ${job.type}`)
      return
    }

    // Process asynchronously — does not block the HTTP response.
    // setImmediate defers execution to the next iteration of the event loop.
    setImmediate(async () => {
      try {
        await handler(job.payload)
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            message: "Job processing failed",
            jobType: job.type,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          })
        )
      }
    })
  }

  process(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler)
  }
}

// TO UPGRADE TO PRODUCTION QUEUE:
// 1. npm install bullmq ioredis
// 2. Replace InMemoryQueue with BullMQQueue (same interface)
// 3. Add REDIS_URL to .env
// 4. Run a worker process: node worker.js
// No changes needed to call sites.

// ── Singleton ───────────────────────────────────────────────────────

export const queue: Queue = new InMemoryQueue()
