'use client'

import { AgentVersion } from '@/types/telemetry'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react'

interface VersionTimelineProps {
  versions: AgentVersion[]
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  const chartData = [...versions].reverse().map(v => ({
    name: v.version,
    sigma: v.sigma,
    status: v.status,
  }))

  const barColors: Record<string, string> = {
    current: '#D4AF37',
    retired: '#94A3B8',
  }

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch size={18} style={{ color: '#D4AF37' }} />
        <h3 className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          Version History
        </h3>
      </div>

      <div className="flex gap-8">
        {/* Timeline */}
        <div className="flex-1">
          <div className="relative pl-6">
            {/* Connecting line */}
            <div
              className="absolute left-[9px] top-3 bottom-3 w-[2px]"
              style={{ background: '#E2E8F0' }}
            />

            {versions.map((v, i) => {
              const isCurrent = v.status === 'current'
              const dotColor = isCurrent ? '#D4AF37' : '#94A3B8'
              const StatusIcon = isCurrent ? CheckCircle2 : XCircle

              return (
                <div key={v.version} className="relative flex items-start gap-4 mb-6 last:mb-0">
                  {/* Dot */}
                  <div
                    className="absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{ background: '#FFFFFF', border: `2px solid ${dotColor}` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-lg px-4 py-3"
                    style={{
                      background: isCurrent ? '#FBF5DC' : '#F7F9FC',
                      border: `1px solid ${isCurrent ? '#D4AF3733' : '#E2E8F0'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                        {v.version}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                        style={{
                          background: isCurrent ? '#ECFDF5' : '#F7F9FC',
                          color: isCurrent ? '#059669' : '#64748B',
                          border: `1px solid ${isCurrent ? '#05966933' : '#E2E8F0'}`,
                        }}
                      >
                        <StatusIcon size={10} />
                        {v.label}
                      </span>
                    </div>

                    <div className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
                      {v.model} &middot; {v.framework}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs" style={{ color: '#64748B' }}>
                        Deployed {formatDate(v.deployedDate)}
                      </span>
                      <span className="text-xs font-semibold font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
                        {v.sigma.toFixed(1)}σ
                      </span>
                    </div>

                    {v.retiredReason && (
                      <div className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>
                        Retired: {v.retiredReason}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sigma chart */}
        <div className="w-64">
          <div className="text-xs font-medium mb-2" style={{ color: '#64748B' }}>
            Sigma by Version
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(10,22,40,0.08)',
                }}
                formatter={(value) => [`${Number(value).toFixed(1)}σ`, 'Sigma']}
              />
              <Bar dataKey="sigma" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={barColors[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
