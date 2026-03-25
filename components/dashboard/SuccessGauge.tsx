'use client'

import { useCountUp } from '@/hooks/useCountUp'
import { Verdict } from '@/types/telemetry'

const COLORS = { GREEN: '#059669', AMBER: '#D97706', RED: '#DC2626' }

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

interface SuccessGaugeProps {
  rate: number // 0-1
  verdict: Verdict
}

export function SuccessGauge({ rate, verdict }: SuccessGaugeProps) {
  const display = useCountUp(rate * 100, 800, 1)
  const color = COLORS[verdict]

  // Arc from 180° (left) to 0° (right) — semicircle
  const cx = 120, cy = 110, r = 90
  const bgPath = describeArc(cx, cy, r, 180, 0)
  const valueDeg = 180 + (rate * 180) // maps 0-1 to 180-360(0)
  const valuePath = describeArc(cx, cy, r, 180, Math.min(valueDeg, 360))

  // SLA marker at 88%
  const slaDeg = 180 + (0.88 * 180)
  const slaRad = (slaDeg * Math.PI) / 180
  const slaX = cx + (r + 8) * Math.cos(slaRad)
  const slaY = cy + (r + 8) * Math.sin(slaRad)
  const slaX2 = cx + (r - 8) * Math.cos(slaRad)
  const slaY2 = cy + (r - 8) * Math.sin(slaRad)

  return (
    <div className="card flex flex-col items-center">
      <svg width="240" height="140" viewBox="0 0 240 140">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#E2E8F0" strokeWidth="16" strokeLinecap="round" />
        {/* Value arc */}
        <path d={valuePath} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.8s" fill="freeze" />
        </path>
        {/* SLA marker */}
        <line x1={slaX} y1={slaY} x2={slaX2} y2={slaY2} stroke="#DC2626" strokeWidth="2" strokeDasharray="3,2" />
        {/* Center number */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="32" fontWeight="700" fill="#0A1628" fontFamily="var(--font-sora)">
          {display}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#64748B">
          Success Rate
        </text>
        {/* SLA label */}
        <text x={slaX2 - 16} y={slaY2 + 4} fontSize="9" fill="#DC2626" fontWeight="600">88% SLA</text>
      </svg>
    </div>
  )
}
