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

// ─── Helpers ─────────────────────────────────────────────────────

function hashKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function extractBearer(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

function validatePayload(body: unknown): { data: RunPayload; error?: never } | { data?: never; error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object' }
  }

  const b = body as Record<string, unknown>

  if (typeof b.runId !== 'string' || !b.runId) return { error: 'runId is required and must be a string' }
  if (typeof b.agentSlug !== 'string' || !b.agentSlug) return { error: 'agentSlug is required and must be a string' }
  if (typeof b.timestamp !== 'string' || !b.timestamp) return { error: 'timestamp is required and must be an ISO string' }
  if (typeof b.durationMs !== 'number' || b.durationMs < 0) return { error: 'durationMs is required and must be a non-negative number' }
  if (typeof b.outcome !== 'boolean') return { error: 'outcome is required and must be a boolean' }
  if (typeof b.totalCost !== 'number' || b.totalCost < 0) return { error: 'totalCost is required and must be a non-negative number' }
  if (typeof b.tokenCount !== 'number' || b.tokenCount < 0) return { error: 'tokenCount is required and must be a non-negative number' }
  if (typeof b.toolCalls !== 'number' || b.toolCalls < 0) return { error: 'toolCalls is required and must be a non-negative number' }

  if (b.spans !== undefined && !Array.isArray(b.spans)) return { error: 'spans must be an array if provided' }

  return { data: b as unknown as RunPayload }
}

// ─── Auth helper ─────────────────────────────────────────────────

async function authenticateRequest(request: Request) {
  const token = extractBearer(request.headers.get('Authorization'))
  if (!token) {
    return { error: NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 }) }
  }

  const hash = hashKey(token)

  const [key] = await db
    .select({ id: apiKeys.id, orgId: apiKeys.orgId })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hash))
    .limit(1)

  if (!key) {
    return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }) }
  }

  return { key, hash }
}

// ─── Resolve agent ───────────────────────────────────────────────

async function resolveAgent(agentSlug: string, orgId: string) {
  // agents belong to a process which belongs to an org — join through processes
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .innerJoin(
      sql`processes`,
      and(
        sql`processes.id = ${agents.processId}`,
        sql`processes.org_id = ${sql.raw(`'${orgId}'`)}`
      )
    )
    .where(eq(agents.slug, agentSlug))
    .limit(1)

  return agent ?? null
}

// ─── Insert run ──────────────────────────────────────────────────

export async function insertRun(payload: RunPayload, agentId: string) {
  const [inserted] = await db
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

  return inserted ?? null
}

// ─── POST /api/v1/ingest/runs ────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const auth = await authenticateRequest(request)
    if ('error' in auth && auth.error) return auth.error

    const { key, hash } = auth as { key: { id: string; orgId: string }; hash: string }

    // 2. Parse & validate body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = validatePayload(body)
    if (validation.error || !validation.data) {
      return NextResponse.json({ error: validation.error ?? 'Invalid payload' }, { status: 400 })
    }
    const payload: RunPayload = validation.data

    // 3. Resolve agent
    const agent = await resolveAgent(payload.agentSlug, key.orgId)
    if (!agent) {
      return NextResponse.json(
        { error: `Agent with slug "${payload.agentSlug}" not found in your organisation` },
        { status: 400 }
      )
    }

    // 4. Insert run (idempotent)
    const inserted = await insertRun(payload, agent.id)

    // 5. Update api_keys.last_used_at
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.keyHash, hash))

    // 6. Return 201
    if (inserted) {
      return NextResponse.json({ id: inserted.id, runId: inserted.runId }, { status: 201 })
    }

    // Conflict — run already existed, still return 201 for idempotency
    return NextResponse.json(
      { runId: payload.runId, message: 'Run already exists (idempotent)' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[ingest/runs] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
