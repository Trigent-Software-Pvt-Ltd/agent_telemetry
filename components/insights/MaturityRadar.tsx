'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import type { MaturityDimension } from '@/types/telemetry'

interface Props {
  dimensions: MaturityDimension[]
}

export default function MaturityRadar({ dimensions }: Props) {
  const data = dimensions.map(d => ({
    dimension: d.dimension,
    score: d.score,
    fullMark: 5,
  }))

  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: 'var(--text-primary)', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            tickCount={6}
          />
          <Tooltip
            formatter={(value) => [`${value}/5`, 'Score']}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#378ADD"
            fill="#378ADD"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
