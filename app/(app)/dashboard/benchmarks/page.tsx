'use client'

import { IndustryBenchmarkTable } from '@/components/dashboard/IndustryBenchmarkTable'
import { IndustryBenchmarkCharts } from '@/components/dashboard/IndustryBenchmarkCharts'
import { BenchmarkRecommendations } from '@/components/dashboard/BenchmarkRecommendations'
import { getIndustryBenchmarks } from '@/lib/mock-data'
import { Award, Trophy } from 'lucide-react'

export default function BenchmarksPage() {
  const benchmarks = getIndustryBenchmarks()
  const avgPercentile = Math.round(benchmarks.reduce((s, b) => s + b.percentile, 0) / benchmarks.length)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award size={20} style={{ color: '#D4AF37' }} />
          <h1 className="text-lg font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Industry Benchmarks
          </h1>
        </div>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          Gaming &amp; iGaming sector &middot; Q1 2026
        </span>
      </div>

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
            Average percentile ranking: <span className="font-bold font-[var(--font-mono-jb)]">{avgPercentile}th</span> across {benchmarks.length} key metrics
          </div>
        </div>
      </div>

      {/* Benchmark Table */}
      <IndustryBenchmarkTable benchmarks={benchmarks} />

      {/* Charts */}
      <IndustryBenchmarkCharts benchmarks={benchmarks} />

      {/* Improvement Recommendations */}
      <div>
        <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
          Improvement Recommendations
        </h3>
        <BenchmarkRecommendations />
      </div>
    </div>
  )
}
