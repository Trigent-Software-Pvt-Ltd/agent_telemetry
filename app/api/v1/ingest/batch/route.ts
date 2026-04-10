import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { apiKeys, agents, runs } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// ─── Types ───────────────────────────────────────────────────────

interface SpanPayload {
  name: string
  duration_ms: number
  status: 'ok' | 'error'
  cost: number
  tool_calls: number
  error?: string
}

interface RunPayload {
  runId: string
  agentSlug: string
  timestamp: string
  durationMs: number
  outcome: boolean
  totalCost: number
  tokenCount: number
  toolCalls: number
  spans?: SpanPayload[]
}

interface BatchPayload {
  runs: RunPayload[]
}

// ─── Helpers ─────────────────────────────────────────────────────

function hashKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function extractBearer(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

function validateRunPayload(b: Record<string, unknown>, index: number): string | null {
  if (typeof b.runId !== 'string' || !b.runId) return `runs[${index}].runId is required and must be a string`
  if (typeof b.agentSlug !== 'string' || !b.agentSlug) return `runs[${index}].agentSlug is required and must be a string`
  if (typeof b.timestamp !== 'string' || !b.timestamp) return `runs[${index}].timestamp is required and must be an ISO string`
  if (typeof b.durationMs !== 'number' || b.durationMs < 0) return `runs[${index}].durationMs is required and must be a non-negative number`
  if (typeof b.outcome !== 'boolean') return `runs[${index}].outcome is required and must be a boolean`
  if (typeof b.totalCost !== 'number' || b.totalCost < 0) return `runs[${index}].totalCost is required and must be a non-negative number`
  if (typeof b.tokenCount !== 'number' || b.tokenCount < 0) return `runs[${index}].tokenCount is required and must be a non-negative number`
  if (typeof b.toolCalls !== 'number' || b.toolCalls < 0) return `runs[${index}].toolCalls is required and must be a non-negative number`
  if (b.spans !== undefined && !Array.isArray(b.spans)) return `runs[${index}].spans must be an array if provided`
  return null
}

// ─── POST /api/v1/ingest/batch ───────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const token = extractBearer(request.headers.get('Authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 })
    }

    const hash = hashKey(token)

    const [key] = await db
      .select({ id: apiKeys.id, orgId: apiKeys.orgId })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, hash))
      .limit(1)

    if (!key) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 2. Parse & validate body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const { runs: runPayloads } = body as BatchPayload

    if (!Array.isArray(runPayloads) || runPayloads.length === 0) {
      return NextResponse.json({ error: 'runs must be a non-empty array' }, { status: 400 })
    }

    if (runPayloads.length > 1000) {
      return NextResponse.json({ error: 'Batch size cannot exceed 1000 runs' }, { status: 400 })
    }

    // Validate each run
    for (let i = 0; i < runPayloads.length; i++) {
      const err = validateRunPayload(runPayloads[i] as unknown as Record<string, unknown>, i)
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 })
      }
    }

    // 3. Resolve all unique agent slugs
    const uniqueSlugs = [...new Set(runPayloads.map((r) => r.agentSlug))]
    const slugToAgentId = new Map<string, string>()

    for (const slug of uniqueSlugs) {
      const [agent] = await db
        .select({ id: agents.id })
        .from(agents)
        .innerJoin(
          sql`processes`,
          and(
            sql`processes.id = ${agents.processId}`,
            sql`processes.org_id = ${sql.raw(`'${key.orgId}'`)}`
          )
        )
        .where(eq(agents.slug, slug))
        .limit(1)

      if (!agent) {
        return NextResponse.json(
          { error: `Agent with slug "${slug}" not found in your organisation` },
          { status: 400 }
        )
      }

      slugToAgentId.set(slug, agent.id)
    }

    // 4. Insert all runs in a transaction
    const results = await db.transaction(async (tx) => {
      const inserted: { id: string; runId: string }[] = []

      for (const payload of runPayloads) {
        const agentId = slugToAgentId.get(payload.agentSlug)!

        const [row] = await tx
          .insert(runs)
          .values({
            runId: payload.runId,
            agentId,
            timestamp: new Date(payload.timestamp),
            durationMs: Math.round(payload.durationMs),
            outcome: payload.outcome,
            totalCost: String(payload.totalCost),
            tokenCount: payload.tokenCount,
            toolCalls: payload.toolCalls,
            spans: payload.spans ?? [],
          })
          .onConflictDoNothing({ target: [runs.agentId, runs.runId] })
          .returning({ id: runs.id, runId: runs.runId })

        if (row) {
          inserted.push(row)
        }
      }

      return inserted
    })

    // 5. Update api_keys.last_used_at
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.keyHash, hash))

    // 6. Return 201
    return NextResponse.json(
      {
        inserted: results.length,
        total: runPayloads.length,
        skipped: runPayloads.length - results.length,
        runs: results,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[ingest/batch] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
