'use client'

import { AlertTriangle, AlertCircle, Info, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Anomaly, AnomalySeverity } from '@/types/telemetry'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

const SEVERITY_CONFIG: Record<AnomalySeverity, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  Critical: { color: '#DC2626', bg: '#FFF5F5', icon: AlertCircle },
  Warning:  { color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
  Info:     { color: '#059669', bg: '#ECFDF5', icon: Info },
}

// Mock sparkline for anomaly trend
const TREND_DATA = [
  { v: 1 }, { v: 1 }, { v: 2 }, { v: 1 }, { v: 3 }, { v: 2 }, { v: 3 },
]

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function AnomalyDetection({ anomalies }: { anomalies: Anomaly[] }) {
  const thisWeek = anomalies.filter(a => a.severity === 'Critical' || a.severity === 'Warning').length
  const lastWeek = 1

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          Detected Anomalies
        </h3>
        <div className="flex items-center gap-4">
          {/* Mini sparkline */}
          <div style={{ width: 80, height: 28 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <Area type="monotone" dataKey="v" stroke="#D97706" fill="#FFFBEB" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {thisWeek} this week vs {lastWeek} last week
            <span className="ml-1">
              <TrendingUp size={12} className="inline" />
              {' '}+{Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}%
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {anomalies.map((anomaly) => {
          const cfg = SEVERITY_CONFIG[anomaly.severity]
          const Icon = cfg.icon
          return (
            <div
              key={anomaly.id}
              className="flex items-start gap-3 p-3 rounded-lg transition-colors"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${cfg.color}15` }}
              >
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{ background: cfg.color, color: '#FFFFFF', letterSpacing: '0.05em' }}
                  >
                    {anomaly.severity}
                  </span>
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                    {formatTimestamp(anomaly.timestamp)}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: '#64748B' }}>
                    {anomaly.agentName}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#0A1628' }}>
                  {anomaly.description}
                </p>
              </div>
              <Link
                href={`/workflows/${anomaly.agentId}`}
                className="flex items-center gap-1 text-xs font-medium shrink-0 mt-1 hover:underline"
                style={{ color: cfg.color }}
              >
                Investigate <ArrowRight size={12} />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
