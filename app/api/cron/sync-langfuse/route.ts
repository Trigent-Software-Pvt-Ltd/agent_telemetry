import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organisations, agents, runs } from '@/lib/db/schema'
import { isNotNull, eq, sql } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

interface LangfuseTrace {
  id: string
  name?: string
  latency?: number
  totalCost?: number
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  status?: string
  startTime?: string
  metadata?: Record<string, unknown>
  usage?: {
    totalTokens?: number
  }
  observations?: Array<{
    type?: string
  }>
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find orgs with langfuse_host configured
    const orgs = await db
      .select()
      .from(organisations)
      .where(isNotNull(organisations.langfuseHost))

    let totalSynced = 0

    for (const org of orgs) {
      if (!org.langfuseHost || !org.langfuseApiKeyEnc) continue

      const lastSync = org.langfuseLastSync
        ? org.langfuseLastSync.toISOString()
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      try {
        const url = `${org.langfuseHost}/api/public/traces?fromTimestamp=${encodeURIComponent(lastSync)}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${org.langfuseApiKeyEnc}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30_000),
        })

        if (!response.ok) {
          console.error(
            `[sync-langfuse] Org ${org.id}: Langfuse API returned ${response.status}`
          )
          continue
        }

        const data = (await response.json()) as { data?: LangfuseTrace[] }
        const traces = data.data ?? []

        // Get all agents for this org's processes
        const orgAgents = await db
          .select({ id: agents.id, slug: agents.slug })
          .from(agents)
          .innerJoin(
            sql`processes`,
            sql`processes.id = ${agents.processId} AND processes.org_id = ${org.id}`
          )

        const agentBySlug = new Map(orgAgents.map((a) => [a.slug, a.id]))

        for (const trace of traces) {
          // Try to match trace to an agent by name/slug
          const agentId = trace.name ? agentBySlug.get(trace.name) : undefined
          if (!agentId) continue

          const durationMs = trace.latency
            ? Math.round(trace.latency * 1000)
            : 0
          const outcome = trace.status !== 'ERROR'
          const totalCost = trace.totalCost ?? 0
          const tokenCount = trace.usage?.totalTokens ?? 0
          const toolCalls = trace.observations?.filter(
            (o) => o.type === 'TOOL'
          ).length ?? 0

          await db
            .insert(runs)
            .values({
              runId: trace.id,
              agentId,
              timestamp: trace.startTime ? new Date(trace.startTime) : new Date(),
              durationMs,
              outcome,
              totalCost: totalCost.toFixed(6),
              tokenCount,
              toolCalls,
              spans: [],
              langfuseTraceId: trace.id,
              metadata: trace.metadata ?? {},
            })
            .onConflictDoNothing()

          totalSynced++
        }

        // Update last sync timestamp
        await db
          .update(organisations)
          .set({ langfuseLastSync: new Date() })
          .where(eq(organisations.id, org.id))
      } catch (fetchErr) {
        console.error(`[sync-langfuse] Org ${org.id}: fetch error`, fetchErr)
        continue
      }
    }

    return NextResponse.json({ ok: true, tracesSynced: totalSynced })
  } catch (err) {
    console.error('[cron/sync-langfuse] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
