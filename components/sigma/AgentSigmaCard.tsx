'use client'

import { StatusDot } from '@/components/shared/StatusDot'
import { SigmaTooltip } from '@/components/shared/SigmaTooltip'
import { useLanguageMode } from '@/hooks/useLanguageMode'
import { useOrganisation } from '@/hooks/useOrganisation'
import { LANGUAGE_MODES, getServqualScores, computeServqualScore } from '@/lib/mock-data'
import type { Agent } from '@/types/telemetry'

const STATUS_BORDER_COLORS: Record<string, string> = {
  green: '#1D9E75',
  amber: '#BA7517',
  red: '#E24B4A',
}

const TREND_ARROWS: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  flat: '\u2192',
}

export function AgentSigmaCard({ agent }: { agent: Agent }) {
  const { mode } = useLanguageMode()
  const { qualityFramework } = useOrganisation()
  const vocab = LANGUAGE_MODES[mode]

  const statusLabel = vocab[agent.status]
  const borderColor = STATUS_BORDER_COLORS[agent.status]

  // SERVQUAL data for the agent's process
  const servqualDimensions = getServqualScores(agent.processId)
  const servqualWeighted = computeServqualScore(servqualDimensions)
  const isServqual = qualityFramework === 'servqual' && mode === 'quality'

  // Find the highest defect category
  const defectEntries = [
    { key: 'failures', value: agent.defects.failures, label: 'Failures' },
    { key: 'latencyBreaches', value: agent.defects.latencyBreaches, label: 'Latency breaches' },
    { key: 'costOverruns', value: agent.defects.costOverruns, label: 'Cost overruns' },
  ]
  const maxDefect = defectEntries.reduce((max, d) => (d.value > max.value ? d : max), defectEntries[0])

  // OEE bar color
  const oeeColor = agent.oee >= 0.75 ? '#1D9E75' : agent.oee >= 0.60 ? '#BA7517' : '#E24B4A'
  const oeePct = Math.round(agent.oee * 100)

  // Quality line content
  const trendArrow = TREND_ARROWS[agent.sigmaTrend]

  return (
    <div
      className="card flex flex-col gap-4"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot status={agent.status} size={10} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
              {agent.name}
            </h3>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {agent.model}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            color: borderColor,
            backgroundColor:
              agent.status === 'green'
                ? '#ECFDF5'
                : agent.status === 'amber'
                  ? '#FFF8EB'
                  : '#FEF2F2',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Quality metric — switches with framework + language mode */}
      <div>
        {isServqual && servqualDimensions.length > 0 ? (
          /* SERVQUAL mode: show weighted score and dimension breakdown */
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold tabular-nums" style={{ color: '#111827' }}>
                {Math.round(servqualWeighted)}%
              </span>
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#6B7280' }}>
                SERVQUAL score
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {servqualDimensions.map((dim) => {
                const barColor = dim.score >= 80 ? '#1D9E75' : dim.score >= 65 ? '#BA7517' : '#E24B4A'
                return (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>
                        {dim.name}
                        <span className="ml-1" style={{ color: '#9CA3AF', fontSize: 10 }}>
                          ({Math.round(dim.weight * 100)}%)
                        </span>
                      </span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: '#111827' }}>
                        {dim.score}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${dim.score}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : mode === 'operations' ? (
          <>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              {vocab.qualityPrefix} {Math.round(agent.successRate * 100)}{vocab.qualitySuffix}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              {agent.sigmaTrend === 'up'
                ? vocab.trendUp
                : agent.sigmaTrend === 'down'
                  ? vocab.trendDown
                  : vocab.trendFlat}
            </p>
          </>
        ) : (
          <div className="flex items-baseline gap-2">
            <SigmaTooltip value={agent.sigmaScore}>
              <span className="text-2xl font-bold tabular-nums" style={{ color: '#111827' }}>
                {agent.sigmaScore.toFixed(1)}&sigma;
              </span>
            </SigmaTooltip>
            <span
              className="text-sm font-semibold"
              style={{
                color:
                  agent.sigmaTrend === 'up'
                    ? '#1D9E75'
                    : agent.sigmaTrend === 'down'
                      ? '#E24B4A'
                      : '#6B7280',
              }}
            >
              {trendArrow}
            </span>
            <span className="text-xs tabular-nums" style={{ color: '#6B7280' }}>
              {vocab.qualityPrefix} {agent.dpmo.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Effectiveness bar — OEE or SERVQUAL weighted */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
            {isServqual ? 'Service quality' : vocab.effectiveness}
          </span>
          <span className="text-xs font-semibold tabular-nums" style={{ color: '#111827' }}>
            {isServqual ? `${Math.round(servqualWeighted)}%` : `${oeePct}%`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${isServqual ? Math.round(servqualWeighted) : oeePct}%`,
              backgroundColor: isServqual
                ? (servqualWeighted >= 80 ? '#1D9E75' : servqualWeighted >= 65 ? '#BA7517' : '#E24B4A')
                : oeeColor,
            }}
          />
        </div>
      </div>

      {/* Defect breakdown (hidden in SERVQUAL mode since dimensions are shown above) */}
      {!isServqual && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Defect breakdown
          </p>
          <div className="flex flex-col gap-1">
            {defectEntries.map((d) => (
              <div key={d.key} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: '#374151' }}>
                  {d.key === maxDefect.key && (
                    <span style={{ color: '#E24B4A', fontSize: '8px' }}>{'\u25CF'}</span>
                  )}
                  {d.key !== maxDefect.key && (
                    <span style={{ fontSize: '8px', visibility: 'hidden' }}>{'\u25CF'}</span>
                  )}
                  {d.label}
                </span>
                <span className="tabular-nums font-medium" style={{ color: '#111827' }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
