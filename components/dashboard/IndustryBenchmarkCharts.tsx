'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import type { IndustryBenchmark } from '@/types/telemetry'

function normalise(value: number, metric: string): number {
  // Normalise to 0-100 scale for radar
  const scales: Record<string, [number, number]> = {
    'Sigma Score': [0, 6],
    'OEE': [0, 100],
    'ROI / Agent / Wk': [0, 1000],
    'Cost / Run': [0, 0.25],
    'Success Rate': [0, 100],
  }
  const [min, max] = scales[metric] ?? [0, 100]
  return Math.round(((value - min) / (max - min)) * 100)
}

export function IndustryBenchmarkCharts({ benchmarks }: { benchmarks: IndustryBenchmark[] }) {
  const barData = benchmarks.map(b => ({
    metric: b.metric.length > 12 ? b.metric.slice(0, 12) + '...' : b.metric,
    fullMetric: b.metric,
    'Your Org': b.yourValue,
    'Industry Avg': b.industryAvg,
    'Top 10%': b.top10Pct,
  }))

  const radarData = benchmarks.map(b => ({
    metric: b.metric,
    'Your Org': normalise(b.yourValue, b.metric),
    'Industry Avg': normalise(b.industryAvg, b.metric),
    'Top 10%': normalise(b.top10Pct, b.metric),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grouped Bar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
          Metric Comparison
        </h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Your Org" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Industry Avg" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Top 10%" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
          Performance Radar
        </h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748B' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94A3B8' }} domain={[0, 100]} />
              <Radar name="Your Org" dataKey="Your Org" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.25} />
              <Radar name="Industry Avg" dataKey="Industry Avg" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.15} />
              <Radar name="Top 10%" dataKey="Top 10%" stroke="#059669" fill="#059669" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
