'use client'

import { getFmeaEntries } from '@/lib/mock-data'
import type { FmeaEntry } from '@/types/telemetry'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from 'recharts'

interface RiskHeatmapProps {
  selectedId: string | null
  onSelect: (entry: FmeaEntry) => void
}

const STATUS_COLORS: Record<string, string> = {
  open: 'var(--status-red)',
  'in-progress': 'var(--status-amber)',
  mitigated: 'var(--status-green)',
}

interface HeatmapPayload {
  failureMode: string
  agentName: string
  rpn: number
  status: string
  severity: number
  occurrence: number
  detection: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: HeatmapPayload }> }) {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--content-bg)',
        borderColor: 'var(--border)',
      }}
    >
      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {d.failureMode}
      </p>
      <p style={{ color: 'var(--text-secondary)' }}>Agent: {d.agentName}</p>
      <p style={{ color: 'var(--text-secondary)' }}>
        RPN: <span className="font-bold" style={{ color: d.rpn > 200 ? 'var(--status-red)' : d.rpn > 100 ? 'var(--status-amber)' : 'var(--status-green)' }}>{d.rpn}</span>
        {' '}({d.severity} x {d.occurrence} x {d.detection})
      </p>
      <p style={{ color: STATUS_COLORS[d.status] }} className="font-medium capitalize">
        {d.status}
      </p>
    </div>
  )
}

export function RiskHeatmap({ selectedId, onSelect }: RiskHeatmapProps) {
  const entries = getFmeaEntries()

  const data = entries.map((e) => ({
    x: e.occurrence,
    y: e.severity,
    z: Math.max(e.rpn / 8, 40), // bubble size
    id: e.id,
    failureMode: e.failureMode,
    agentName: e.agentName,
    rpn: e.rpn,
    status: e.status,
    severity: e.severity,
    occurrence: e.occurrence,
    detection: e.detection,
    _entry: e,
  }))

  return (
    <div className="card" style={{ padding: '16px 12px 12px 12px' }}>
      <h2 className="text-sm font-bold mb-3 px-2" style={{ color: 'var(--text-primary)' }}>
        Risk Heatmap
        <span className="font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
          Severity vs Occurrence
        </span>
      </h2>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          {/* Background quadrants */}
          <ReferenceArea x1={0.5} x2={5} y1={0.5} y2={5} fill="#16a34a" fillOpacity={0.06} />
          <ReferenceArea x1={5} x2={10.5} y1={0.5} y2={5} fill="#eab308" fillOpacity={0.08} />
          <ReferenceArea x1={0.5} x2={5} y1={5} y2={10.5} fill="#f97316" fillOpacity={0.08} />
          <ReferenceArea x1={5} x2={10.5} y1={5} y2={10.5} fill="#ef4444" fillOpacity={0.1} />

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            dataKey="x"
            name="Occurrence"
            domain={[0.5, 10.5]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            label={{ value: 'Occurrence', position: 'insideBottom', offset: -10, fontSize: 12, fill: 'var(--text-secondary)' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Severity"
            domain={[0.5, 10.5]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            label={{ value: 'Severity', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: 'var(--text-secondary)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Scatter data={data} onClick={(point: any) => onSelect(point._entry)}>
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={STATUS_COLORS[entry.status]}
                fillOpacity={entry.id === selectedId ? 1 : 0.75}
                stroke={entry.id === selectedId ? 'var(--text-primary)' : 'white'}
                strokeWidth={entry.id === selectedId ? 2.5 : 1.5}
                r={entry.z / 6}
                cursor="pointer"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--status-red)' }} />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--status-amber)' }} />
          In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--status-green)' }} />
          Mitigated
        </span>
        <span style={{ color: 'var(--text-muted)' }}>|</span>
        <span>Dot size = RPN magnitude</span>
      </div>
    </div>
  )
}
