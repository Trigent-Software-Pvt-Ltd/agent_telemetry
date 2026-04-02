'use client'

import { useState } from 'react'
import { getAgentRoisForProcess } from '@/lib/mock-data'
import type { RoiSnapshot, AgentRoi } from '@/types/telemetry'

interface RoiWaterfallProps {
  roi: RoiSnapshot
}

interface WaterfallStep {
  label: string
  value: number
  type: 'positive' | 'negative' | 'net'
  displayValue: string
}

export function RoiWaterfall({ roi }: RoiWaterfallProps) {
  const [showAgentBreakdown, setShowAgentBreakdown] = useState(false)
  const agentRois = getAgentRoisForProcess(roi.processId)

  const steps: WaterfallStep[] = [
    {
      label: 'Gross saving',
      value: roi.grossSavingWeekly,
      type: 'positive',
      displayValue: `$${roi.grossSavingWeekly.toLocaleString()}`,
    },
    {
      label: 'Oversight',
      value: roi.oversightCostWeekly,
      type: 'negative',
      displayValue: `-$${roi.oversightCostWeekly}`,
    },
    {
      label: 'Inference',
      value: roi.inferenceCostWeekly,
      type: 'negative',
      displayValue: `-$${roi.inferenceCostWeekly}`,
    },
    {
      label: 'Governance',
      value: roi.governanceOverheadWeekly,
      type: 'negative',
      displayValue: `-$${roi.governanceOverheadWeekly}`,
    },
    {
      label: 'Net ROI',
      value: roi.netRoiWeekly,
      type: 'net',
      displayValue: `$${roi.netRoiWeekly.toLocaleString()}`,
    },
  ]

  // Calculate bar widths relative to gross (the largest value)
  const maxValue = roi.grossSavingWeekly

  function getBarColor(type: WaterfallStep['type']): string {
    switch (type) {
      case 'positive': return 'var(--status-green)'
      case 'negative': return 'var(--status-red)'
      case 'net': return 'var(--accent-blue)'
    }
  }

  function getBgColor(type: WaterfallStep['type']): string {
    switch (type) {
      case 'positive': return 'var(--status-green-bg)'
      case 'negative': return 'var(--status-red-bg)'
      case 'net': return 'var(--accent-blue-bg)'
    }
  }

  return (
    <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
        ROI Waterfall (weekly)
      </div>

      {/* Horizontal waterfall flow */}
      <div className="flex items-stretch gap-0 w-full">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const barWidthPct = Math.max(12, (step.value / maxValue) * 100)

          return (
            <div key={step.label} className="flex items-center" style={{ flex: isLast ? '1 1 auto' : '0 0 auto' }}>
              {/* Step block */}
              <div
                className="flex flex-col items-center px-3 py-3 rounded-lg min-w-[90px]"
                style={{ background: getBgColor(step.type) }}
              >
                <span className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {step.label}
                </span>
                <span
                  className="text-base font-bold tabular-nums"
                  style={{
                    color: getBarColor(step.type),
                    fontSize: isLast ? '1.25rem' : undefined,
                  }}
                >
                  {step.displayValue}
                </span>
                {/* Mini bar */}
                <div
                  className="mt-2 h-1.5 rounded-full w-full overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.06)', maxWidth: 80 }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      background: getBarColor(step.type),
                      width: `${barWidthPct}%`,
                    }}
                  />
                </div>
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex items-center px-1">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path
                      d="M0 6H16M16 6L12 1M16 6L12 11"
                      stroke="var(--text-muted)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Agent-level breakdown toggle */}
      {agentRois.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowAgentBreakdown(!showAgentBreakdown)}
            className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0 }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: showAgentBreakdown ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Per-agent contribution
          </button>

          {showAgentBreakdown && (
            <div className="mt-3">
              {/* Stacked bar showing each agent's share of net ROI */}
              <div className="flex items-center gap-1 h-6 rounded-lg overflow-hidden mb-3">
                {agentRois.map((ar, i) => {
                  const totalNet = agentRois.reduce((s, r) => s + Math.max(0, r.netRoiWeekly), 0)
                  const pct = totalNet > 0 ? (Math.max(0, ar.netRoiWeekly) / totalNet) * 100 : 0
                  const colors = ['var(--status-green)', 'var(--accent-blue)', 'var(--vip-gold, #D4AF37)', 'var(--status-amber)']
                  return (
                    <div
                      key={ar.agentId}
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: ar.netRoiWeekly >= 0 ? colors[i % colors.length] : 'var(--status-red)',
                        opacity: 0.85,
                      }}
                    />
                  )
                })}
              </div>

              {/* Agent detail rows */}
              <div className="flex flex-col gap-2">
                {agentRois.map((ar, i) => {
                  const isPositive = ar.netRoiWeekly >= 0
                  const colors = ['var(--status-green)', 'var(--accent-blue)', 'var(--vip-gold, #D4AF37)', 'var(--status-amber)']
                  return (
                    <div
                      key={ar.agentId}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: colors[i % colors.length] }}
                        />
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {ar.agentName}
                          </span>
                          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {ar.taskTimeWeightPct}% time &middot; Saving ${ar.grossSavingWeekly} &middot; Cost ${ar.inferenceCostWeekly.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: isPositive ? 'var(--status-green)' : 'var(--status-red)' }}
                      >
                        ${ar.netRoiWeekly.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
