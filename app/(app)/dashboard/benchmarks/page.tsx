'use client'

import { useState } from 'react'
import { getProcessBenchmarks, getIndustryBenchmarks } from '@/lib/mock-data'
import { BenchmarkTable } from '@/components/dashboard/BenchmarkTable'
import { BenchmarkRadar } from '@/components/dashboard/BenchmarkRadar'
import { BenchmarkInsights } from '@/components/dashboard/BenchmarkInsights'
import { IndustryBenchmarkTable } from '@/components/dashboard/IndustryBenchmarkTable'
import { IndustryBenchmarkCharts } from '@/components/dashboard/IndustryBenchmarkCharts'
import { BenchmarkRecommendations } from '@/components/dashboard/BenchmarkRecommendations'
import { Trophy, TrendingUp, TrendingDown, Activity, DollarSign, Award } from 'lucide-react'

type TabId = 'cross-process' | 'industry'

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

export default function BenchmarksPage() {
  const [activeTab, setActiveTab] = useState<TabId>('cross-process')

  const benchmarks = getProcessBenchmarks()
  const industryBenchmarks = getIndustryBenchmarks()

  const best = benchmarks[0]
  const worst = benchmarks[benchmarks.length - 1]
  const avgSigma = benchmarks.length > 0
    ? (benchmarks.reduce((s, b) => s + b.avgSigma, 0) / benchmarks.length).toFixed(1)
    : '0'
  const totalRoi = benchmarks.reduce((s, b) => s + b.netRoiWeekly, 0)
  const avgPercentile = Math.round(industryBenchmarks.reduce((s, b) => s + b.percentile, 0) / industryBenchmarks.length)

  const tabs: { id: TabId; label: string }[] = [
    { id: 'cross-process', label: 'Cross-Process' },
    { id: 'industry', label: 'Industry' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>
          Benchmarks
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Compare processes internally and against industry standards
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="inline-flex rounded-lg p-1 self-start"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
            style={{
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'cross-process' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Best Process"
              value={best?.processName ?? 'N/A'}
              subValue={best ? `${best.avgSigma.toFixed(1)}\u03C3 avg` : undefined}
              icon={TrendingUp}
              color="var(--status-green)"
            />
            <SummaryCard
              label="Needs Improvement"
              value={worst?.processName ?? 'N/A'}
              subValue={worst ? `${worst.avgSigma.toFixed(1)}\u03C3 avg` : undefined}
              icon={TrendingDown}
              color="var(--status-red)"
            />
            <SummaryCard
              label="Avg Sigma (All)"
              value={`${avgSigma}\u03C3`}
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
        </>
      )}

      {activeTab === 'industry' && (
        <>
          {/* Percentile Ranking Card */}
          <div
            className="card animate-fade-up flex items-center gap-4"
            style={{ background: '#FBF5DC', border: '1px solid #D4AF37' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#D4AF37' }}
            >
              <Trophy size={24} style={{ color: '#0A1628' }} />
            </div>
            <div>
              <div className="text-lg font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                FuzeBox AI is in the top {100 - avgPercentile}% of gaming companies for agent quality
              </div>
              <div className="text-xs mt-1" style={{ color: '#64748B' }}>
                Average percentile ranking: <span className="font-bold font-[var(--font-mono-jb)]">{avgPercentile}th</span> across {industryBenchmarks.length} key metrics
              </div>
            </div>
          </div>

          {/* Benchmark Table */}
          <IndustryBenchmarkTable benchmarks={industryBenchmarks} />

          {/* Charts */}
          <IndustryBenchmarkCharts benchmarks={industryBenchmarks} />

          {/* Improvement Recommendations */}
          <div>
            <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
              Improvement Recommendations
            </h3>
            <BenchmarkRecommendations />
          </div>
        </>
      )}
    </div>
  )
}
