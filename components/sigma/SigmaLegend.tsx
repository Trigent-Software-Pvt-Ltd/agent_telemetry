'use client'

import { SIGMA_LEVELS } from '@/lib/mock-data'
import type { Agent } from '@/types/telemetry'

const STATUS_COLORS: Record<string, string> = {
  green: '#1D9E75',
  amber: '#BA7517',
  red: '#E24B4A',
}

interface SigmaLegendProps {
  agents: Agent[]
  target: number
}

export function SigmaLegend({ agents, target }: SigmaLegendProps) {
  const minSigma = 1
  const maxSigma = 6
  const range = maxSigma - minSigma // 5

  function sigmaToPercent(sigma: number): number {
    return ((sigma - minSigma) / range) * 100
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>
        Sigma Translation Scale
      </h3>
      <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>
        Where each agent sits relative to the standard sigma levels
      </p>

      {/* Scale */}
      <div className="relative" style={{ height: 120 }}>
        {/* Background track */}
        <div
          className="absolute left-0 right-0 rounded-full"
          style={{
            top: 48,
            height: 8,
            background: 'linear-gradient(to right, #E24B4A, #BA7517 40%, #1D9E75 70%, #1D9E75)',
          }}
        />

        {/* Sigma level markers */}
        {SIGMA_LEVELS.map((level) => {
          const pct = sigmaToPercent(level.sigma)
          return (
            <div
              key={level.sigma}
              className="absolute flex flex-col items-center"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
            >
              {/* Top label */}
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#111827' }}>
                {level.sigma}&sigma;
              </span>
              <span className="text-[9px] mb-1" style={{ color: '#9CA3AF' }}>
                {level.dpmo >= 1000
                  ? `${Math.round(level.dpmo / 1000)}k`
                  : level.dpmo.toFixed(1)}
              </span>

              {/* Tick mark */}
              <div
                style={{
                  width: 1,
                  height: 12,
                  backgroundColor: '#D1D5DB',
                }}
              />

              {/* Bottom label */}
              <span
                className="text-[10px] mt-1.5 text-center whitespace-nowrap"
                style={{ color: '#6B7280' }}
              >
                {level.shortLabel}
              </span>
            </div>
          )
        })}

        {/* Target line at 4.0 sigma */}
        <div
          className="absolute"
          style={{
            left: `${sigmaToPercent(target)}%`,
            top: 32,
            height: 36,
            width: 2,
            backgroundColor: '#378ADD',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        />
        <div
          className="absolute text-[10px] font-semibold"
          style={{
            left: `${sigmaToPercent(target)}%`,
            top: 18,
            transform: 'translateX(-50%)',
            color: '#378ADD',
            whiteSpace: 'nowrap',
          }}
        >
          Target {target.toFixed(1)}&sigma;
        </div>

        {/* Agent markers */}
        {agents.map((agent, i) => {
          const pct = sigmaToPercent(agent.sigmaScore)
          // Stagger vertically to avoid overlap
          const topOffset = 72 + i * 18
          return (
            <div
              key={agent.id}
              className="absolute flex items-center gap-1.5"
              style={{
                left: `${pct}%`,
                top: topOffset,
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              {/* Diamond marker */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: STATUS_COLORS[agent.status],
                  transform: 'rotate(45deg)',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: STATUS_COLORS[agent.status] }}
              >
                {agent.name.replace(' Agent', '')} ({agent.sigmaScore.toFixed(1)}&sigma;)
              </span>
            </div>
          )
        })}
      </div>

      {/* Full label row below */}
      <div
        className="mt-4 pt-3 grid gap-2"
        style={{
          borderTop: '1px solid #E8E6E0',
          gridTemplateColumns: 'repeat(6, 1fr)',
        }}
      >
        {SIGMA_LEVELS.map((level) => (
          <div key={level.sigma} className="text-center">
            <p className="text-[10px] font-bold tabular-nums" style={{ color: '#111827' }}>
              {level.sigma}&sigma; &mdash; {level.dpmo.toLocaleString()} DPMO
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: '#6B7280' }}>
              {level.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
