'use client'

import { AgentSlaConfig } from '@/lib/mock-data'

interface SlaAgentRowProps {
  config: AgentSlaConfig
  onChange: (updated: AgentSlaConfig) => void
}

function statusColor(current: number, target: number, mode: 'gte' | 'lte'): string {
  if (mode === 'gte') {
    if (current >= target) return '#059669'
    if (current >= target * 0.9) return '#D97706'
    return '#DC2626'
  }
  // lte: lower is better (latency, cost)
  if (current <= target) return '#059669'
  if (current <= target * 1.15) return '#D97706'
  return '#DC2626'
}

function statusBg(current: number, target: number, mode: 'gte' | 'lte'): string {
  if (mode === 'gte') {
    if (current >= target) return '#ECFDF5'
    if (current >= target * 0.9) return '#FFFBEB'
    return '#FFF5F5'
  }
  if (current <= target) return '#ECFDF5'
  if (current <= target * 1.15) return '#FFFBEB'
  return '#FFF5F5'
}

function ComparisonPill({ label, current, target, unit, mode }: {
  label: string
  current: number
  target: number
  unit: string
  mode: 'gte' | 'lte'
}) {
  const color = statusColor(current, target, mode)
  const bg = statusBg(current, target, mode)
  const displayCurrent = unit === '$' ? `$${current.toFixed(4)}` : unit === 'ms' ? `${current}ms` : `${current}${unit}`
  const displayTarget = unit === '$' ? `$${target.toFixed(2)}` : unit === 'ms' ? `${target}ms` : `${target}${unit}`

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium" style={{ color: '#64748B', minWidth: 60 }}>{label}</span>
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold font-[var(--font-mono-jb)]"
        style={{ background: bg, color }}
      >
        <span>{displayCurrent}</span>
        <span style={{ color: '#94A3B8' }}>/</span>
        <span style={{ color: '#64748B' }}>{displayTarget}</span>
      </div>
    </div>
  )
}

export function SlaAgentRow({ config, onChange }: SlaAgentRowProps) {
  const update = (key: keyof AgentSlaConfig, value: number) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="card mb-4" style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{config.agentName}</div>
          <div className="text-[11px]" style={{ color: '#64748B' }}>
            {config.workflowName} &middot; {config.model}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ComparisonPill label="Latency" current={config.currentLatencyP95} target={config.latencyTarget} unit="ms" mode="lte" />
          <ComparisonPill label="Cost" current={config.currentAvgCost} target={config.costCap} unit="$" mode="lte" />
          <ComparisonPill label="Success" current={config.currentSuccessRate} target={config.successRateFloor} unit="%" mode="gte" />
          <ComparisonPill label="Sigma" current={config.currentSigma} target={config.sigmaTarget} unit="" mode="gte" />
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency Target */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Latency target
          </label>
          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={config.latencyTarget}
            onChange={e => update('latencyTarget', Number(e.target.value))}
            className="w-full accent-[#D4AF37]"
          />
          <div className="text-[11px] font-[var(--font-mono-jb)] mt-0.5" style={{ color: '#0A1628' }}>
            {config.latencyTarget}ms
          </div>
        </div>

        {/* Cost Cap */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Cost cap / run
          </label>
          <input
            type="range"
            min={0.01}
            max={1.0}
            step={0.01}
            value={config.costCap}
            onChange={e => update('costCap', Number(e.target.value))}
            className="w-full accent-[#D4AF37]"
          />
          <div className="text-[11px] font-[var(--font-mono-jb)] mt-0.5" style={{ color: '#0A1628' }}>
            ${config.costCap.toFixed(2)}
          </div>
        </div>

        {/* Success Rate Floor */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Success floor
          </label>
          <input
            type="range"
            min={70}
            max={99}
            step={1}
            value={config.successRateFloor}
            onChange={e => update('successRateFloor', Number(e.target.value))}
            className="w-full accent-[#D4AF37]"
          />
          <div className="text-[11px] font-[var(--font-mono-jb)] mt-0.5" style={{ color: '#0A1628' }}>
            {config.successRateFloor}%
          </div>
        </div>

        {/* Sigma Target */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Sigma target
          </label>
          <input
            type="range"
            min={2.0}
            max={6.0}
            step={0.1}
            value={config.sigmaTarget}
            onChange={e => update('sigmaTarget', Number(e.target.value))}
            className="w-full accent-[#D4AF37]"
          />
          <div className="text-[11px] font-[var(--font-mono-jb)] mt-0.5" style={{ color: '#0A1628' }}>
            {config.sigmaTarget.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
