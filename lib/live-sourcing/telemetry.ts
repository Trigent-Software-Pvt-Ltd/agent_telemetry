/**
 * Telemetry wrapper around `generateText` / `generateObject` from the `ai`
 * package. Captures latency, tokens, and estimated USD cost on every call.
 *
 * Claude Sonnet 4.5 pricing (approx, as of 2026-04):
 *   $3 per 1M input tokens  -> $0.000003 / token
 *   $15 per 1M output tokens -> $0.000015 / token
 */

import { generateObject, generateText } from 'ai'
import type { ZodType } from 'zod'
import type { SpecialistMetric } from './types'
import { getClaudeModel } from './config'

export const CLAUDE_INPUT_COST_PER_TOKEN = 3 / 1_000_000
export const CLAUDE_OUTPUT_COST_PER_TOKEN = 15 / 1_000_000

export function estimateCostUsd(tokensIn: number, tokensOut: number): number {
  return tokensIn * CLAUDE_INPUT_COST_PER_TOKEN + tokensOut * CLAUDE_OUTPUT_COST_PER_TOKEN
}

/** LanguageModelUsage has undefined-able fields; coalesce to 0. */
function tokens(u: { inputTokens?: number; outputTokens?: number } | undefined): {
  tokensIn: number
  tokensOut: number
} {
  return {
    tokensIn: u?.inputTokens ?? 0,
    tokensOut: u?.outputTokens ?? 0,
  }
}

function model(): string {
  // AI Gateway model string form, e.g. 'anthropic/claude-sonnet-4-5'.
  return getClaudeModel()
}

/**
 * `generateText` with captured telemetry.
 */
export async function runText(args: {
  system?: string
  prompt: string
  temperature?: number
  maxOutputTokens?: number
}): Promise<{ text: string; metric: SpecialistMetric }> {
  const started = Date.now()
  const result = await generateText({
    model: model(),
    system: args.system,
    prompt: args.prompt,
    temperature: args.temperature,
    maxOutputTokens: args.maxOutputTokens,
  })
  const latencyMs = Date.now() - started
  const { tokensIn, tokensOut } = tokens(result.usage)
  return {
    text: result.text,
    metric: {
      latencyMs,
      tokensIn,
      tokensOut,
      costUsd: estimateCostUsd(tokensIn, tokensOut),
    },
  }
}

/**
 * `generateObject` with captured telemetry. Schema is a zod schema the caller
 * owns. Returns the parsed object and a SpecialistMetric.
 */
export async function runObject<T>(args: {
  system?: string
  prompt: string
  schema: ZodType<T>
  schemaName?: string
  schemaDescription?: string
  temperature?: number
  maxOutputTokens?: number
}): Promise<{ object: T; metric: SpecialistMetric }> {
  const started = Date.now()
  const result = await generateObject({
    model: model(),
    system: args.system,
    prompt: args.prompt,
    schema: args.schema,
    schemaName: args.schemaName,
    schemaDescription: args.schemaDescription,
    temperature: args.temperature,
    maxOutputTokens: args.maxOutputTokens,
  })
  const latencyMs = Date.now() - started
  const { tokensIn, tokensOut } = tokens(result.usage)
  return {
    object: result.object as T,
    metric: {
      latencyMs,
      tokensIn,
      tokensOut,
      costUsd: estimateCostUsd(tokensIn, tokensOut),
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
