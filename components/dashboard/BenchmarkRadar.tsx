'use client'

import type { ProcessBenchmark } from '@/types/telemetry'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface BenchmarkRadarProps {
  benchmarks: ProcessBenchmark[]
}

const COLORS = ['#378ADD', '#D4AF37', '#7C3AED', '#059669', '#DC2626']

const DIMENSIONS = ['Quality', 'Coverage', 'ROI', 'Cost Efficiency', 'Compliance'] as const

export function BenchmarkRadar({ benchmarks }: BenchmarkRadarProps) {
  // Transform data for Recharts RadarChart
  const data = DIMENSIONS.map(dim => {
    const entry: Record<string, string | number> = { dimension: dim }
    benchmarks.forEach(b => {
      const key = dim.toLowerCase().replace(/\s/g, '')
      const map: Record<string, number> = {
        quality: b.quality,
        coverage: b.coverage,
        roi: b.roi,
        costefficiency: b.costEfficiency,
        compliance: b.compliance,
      }
      entry[b.processName] = map[key] ?? 0
    })
    return entry
  })

  return (
    <div className="card animate-fade-up">
      <h2 className="text-base font-semibold mb-4">Performance Radar</h2>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            {benchmarks.map((b, i) => (
              <Radar
                key={b.processId}
                name={b.processName}
                dataKey={b.processName}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
