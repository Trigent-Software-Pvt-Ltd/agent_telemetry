import { db } from '@/lib/db'
import { runs } from '@/lib/db/schema'
import { gt, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()
  let lastSeenTimestamp = new Date()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(': heartbeat\n\n'))

      const poll = async () => {
        if (closed) return

        try {
          const newRuns = await db
            .select()
            .from(runs)
            .where(gt(runs.timestamp, lastSeenTimestamp))
            .orderBy(desc(runs.timestamp))
            .limit(50)

          if (newRuns.length > 0) {
            lastSeenTimestamp = newRuns[0].timestamp
            for (const run of newRuns) {
              const event = `event: run\ndata: ${JSON.stringify(run)}\n\n`
              controller.enqueue(encoder.encode(event))
            }
          } else {
            // Send keepalive comment every poll cycle when no data
            controller.enqueue(encoder.encode(': keepalive\n\n'))
          }
        } catch (err) {
          console.error('[SSE] Poll error:', err)
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'poll failed' })}\n\n`)
          )
        }

        if (!closed) {
          setTimeout(poll, 5000)
        }
      }

      // Start polling
      poll()
    },
    cancel() {
      closed = true
    },
  })

  // Handle client disconnect via AbortSignal
  request.signal.addEventListener('abort', () => {
    closed = true
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
