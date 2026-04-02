'use client'

import { getProcessBenchmarks } from '@/lib/mock-data'
import { BenchmarkTable } from '@/components/dashboard/BenchmarkTable'
import { BenchmarkRadar } from '@/components/dashboard/BenchmarkRadar'
import { BenchmarkInsights } from '@/components/dashboard/BenchmarkInsights'
import { Trophy, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'

function SummaryCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  subValue?: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
        {subValue && (
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subValue}</div>
        )}
      </div>
    </div>
  )
}

export default function BenchmarkPage() {
  const benchmarks = getProcessBenchmarks()

  const best = benchmarks[0]
  const worst = benchmarks[benchmarks.length - 1]
  const avgSigma = benchmarks.length > 0
    ? (benchmarks.reduce((s, b) => s + b.avgSigma, 0) / benchmarks.length).toFixed(1)
    : '0'
  const totalRoi = benchmarks.reduce((s, b) => s + b.netRoiWeekly, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>
          Cross-Process Benchmark
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Compare processes across quality, coverage, ROI, and compliance dimensions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Best Process"
          value={best?.processName ?? 'N/A'}
          subValue={best ? `${best.avgSigma.toFixed(1)}σ avg` : undefined}
          icon={TrendingUp}
          color="var(--status-green)"
        />
        <SummaryCard
          label="Needs Improvement"
          value={worst?.processName ?? 'N/A'}
          subValue={worst ? `${worst.avgSigma.toFixed(1)}σ avg` : undefined}
          icon={TrendingDown}
          color="var(--status-red)"
        />
        <SummaryCard
          label="Avg Sigma (All)"
          value={`${avgSigma}σ`}
          subValue={`${benchmarks.length} processes`}
          icon={Activity}
          color="var(--accent-blue)"
        />
        <SummaryCard
          label="Total ROI/week"
          value={`$${totalRoi.toLocaleString()}`}
          subValue="Combined net ROI"
          icon={DollarSign}
          color="var(--status-green)"
        />
      </div>

      {/* Table */}
      <BenchmarkTable benchmarks={benchmarks} />

      {/* Radar + Insights side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BenchmarkRadar benchmarks={benchmarks} />
        <BenchmarkInsights benchmarks={benchmarks} />
      </div>
    </div>
  )
}
