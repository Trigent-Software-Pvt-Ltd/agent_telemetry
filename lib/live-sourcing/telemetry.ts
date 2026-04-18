/**
 * AWS Bedrock wrapper for Claude. Captures latency, tokens, and estimated USD
 * cost on every call. Replaces the previous Vercel AI Gateway (AI SDK) wrapper.
 *
 * Credentials + region are picked up from the standard AWS env chain:
 *   AWS_REGION (default 'us-east-1')
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *
 * Model id is taken from `BEDROCK_MODEL_ID` (see ./config.ts). Defaults to the
 * Haiku 4.5 cross-region inference profile for cheap/fast classification.
 *
 * Pricing table below is in USD per 1M tokens and should be kept in sync with
 * the AWS Bedrock pricing page. Values are approximate and update as needed.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import type { SpecialistMetric } from './types'
import { getBedrockModelId } from './config'

// --- Pricing (USD per 1M tokens) ------------------------------------------

const PRICING: Record<string, { input: number; output: number }> = {
  // Haiku 4.5 — cheap/fast default
  'us.anthropic.claude-haiku-4-5-20251001-v1:0': { input: 1.0, output: 5.0 },
  'anthropic.claude-haiku-4-5-20251001-v1:0': { input: 1.0, output: 5.0 },
  // Sonnet 4.6
  'us.anthropic.claude-sonnet-4-6-20260115-v1:0': { input: 3.0, output: 15.0 },
  'anthropic.claude-sonnet-4-6-20260115-v1:0': { input: 3.0, output: 15.0 },
  // Opus 4.7
  'us.anthropic.claude-opus-4-7-20260115-v1:0': { input: 15.0, output: 75.0 },
  'anthropic.claude-opus-4-7-20260115-v1:0': { input: 15.0, output: 75.0 },
}

/** Cost in USD for a single call. Falls back to Sonnet pricing for unknown ids. */
function costFor(modelId: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[modelId] ?? { input: 3.0, output: 15.0 }
  return (tokensIn * p.input + tokensOut * p.output) / 1_000_000
}

// --- Client singleton -----------------------------------------------------

let _client: BedrockRuntimeClient | null = null

function client(): BedrockRuntimeClient {
  if (_client) return _client
  const region = process.env.AWS_REGION?.trim() || 'us-east-1'
  _client = new BedrockRuntimeClient({ region })
  return _client
}

// --- Public API -----------------------------------------------------------

export interface BedrockCallArgs {
  system?: string
  userPrompt: string
  /** default 512 */
  maxTokens?: number
  /** default 0 */
  temperature?: number
}

export interface BedrockCallResult {
  /** Raw assistant text content. */
  text: string
  metric: SpecialistMetric
}

/** Shape of Anthropic Claude-on-Bedrock response body. */
interface BedrockClaudeResponse {
  content?: Array<{ type?: string; text?: string }>
  usage?: { input_tokens?: number; output_tokens?: number }
  stop_reason?: string
}

/**
 * Invoke Claude on AWS Bedrock via InvokeModelCommand. Captures latency,
 * token counts, and USD cost into a SpecialistMetric alongside the text.
 */
export async function invokeClaude(args: BedrockCallArgs): Promise<BedrockCallResult> {
  const modelId = getBedrockModelId()
  const maxTokens = args.maxTokens ?? 512
  const temperature = args.temperature ?? 0

  const body: Record<string, unknown> = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: args.userPrompt }],
  }
  if (args.system && args.system.trim() !== '') {
    body.system = args.system
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  })

  const started = Date.now()
  const response = await client().send(command)
  const latencyMs = Date.now() - started

  const raw = new TextDecoder().decode(response.body)
  let parsed: BedrockClaudeResponse
  try {
    parsed = JSON.parse(raw) as BedrockClaudeResponse
  } catch {
    parsed = {}
  }

  const text =
    parsed.content?.find(c => c.type === 'text' || typeof c.text === 'string')?.text ??
    parsed.content?.[0]?.text ??
    ''

  const tokensIn = parsed.usage?.input_tokens ?? 0
  const tokensOut = parsed.usage?.output_tokens ?? 0

  return {
    text,
    metric: {
      latencyMs,
      tokensIn,
      tokensOut,
      costUsd: costFor(modelId, tokensIn, tokensOut),
    },
  }
}

/** Aggregate per-call metrics into one total (used by the Manager). */
export function sumMetrics(metrics: SpecialistMetric[]): SpecialistMetric {
  return metrics.reduce<SpecialistMetric>(
    (acc, m) => ({
      latencyMs: acc.latencyMs + m.latencyMs,
      tokensIn: acc.tokensIn + m.tokensIn,
      tokensOut: acc.tokensOut + m.tokensOut,
      costUsd: acc.costUsd + m.costUsd,
    }),
    { latencyMs: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 },
  )
}
