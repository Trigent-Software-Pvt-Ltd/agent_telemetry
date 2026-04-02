'use client'

import { getBuildVsProcesses, getBuildVsDecisionFactors } from '@/lib/mock-data'

export default function BuildVsBuy() {
  const processes = getBuildVsProcesses()
  const factors = getBuildVsDecisionFactors()

  const totalWeightedBuild = factors.reduce((a, f) => a + f.weight * f.buildScore, 0) / 100
  const totalWeightedBuy = factors.reduce((a, f) => a + f.weight * f.buyScore, 0) / 100

  return (
    <div className="flex flex-col gap-6">
      {/* Per-process comparison */}
      {processes.map(proc => {
        const isBuild = proc.recommendation === 'build'
        return (
          <div key={proc.processId} className="card">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              {proc.processName}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Factor</th>
                    <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Build Custom</th>
                    <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Buy Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">Estimated Cost</td>
                    <td className="py-2.5 text-center tabular-nums">${proc.build.estimatedCost.toLocaleString()}</td>
                    <td className="py-2.5 text-center tabular-nums">${proc.buy.estimatedCost.toLocaleString()}</td>
                  </tr>
                  <tr className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">Timeline</td>
                    <td className="py-2.5 text-center">{proc.build.timeline}</td>
                    <td className="py-2.5 text-center">{proc.buy.timeline}</td>
                  </tr>
                  <tr className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">Risk Level</td>
                    <td className="py-2.5 text-center">
                      <RiskBadge level={proc.build.riskLevel} />
                    </td>
                    <td className="py-2.5 text-center">
                      <RiskBadge level={proc.buy.riskLevel} />
                    </td>
                  </tr>
                  <tr className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">Control Level</td>
                    <td className="py-2.5 text-center">{proc.build.controlLevel}</td>
                    <td className="py-2.5 text-center">{proc.buy.controlLevel}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation */}
            <div
              className="mt-4 p-3 rounded-lg text-xs"
              style={{
                background: isBuild ? 'rgba(55, 138, 221, 0.06)' : 'var(--status-green-bg)',
                border: `1px solid ${isBuild ? 'rgba(55, 138, 221, 0.2)' : 'rgba(29,158,117,0.2)'}`,
              }}
            >
              <span
                className="font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded mr-2"
                style={{
                  background: isBuild ? '#378ADD' : 'var(--status-green)',
                  color: '#FFFFFF',
                }}
              >
                {proc.recommendation} Recommended
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {proc.reasoning}
              </span>
            </div>
          </div>
        )
      })}

      {/* Weighted Decision Matrix */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Weighted Decision Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Factor</th>
                <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Weight</th>
                <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Build (1-5)</th>
                <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Buy (1-5)</th>
                <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Build Weighted</th>
                <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Buy Weighted</th>
              </tr>
            </thead>
            <tbody>
              {factors.map(f => {
                const buildW = (f.weight * f.buildScore / 100).toFixed(2)
                const buyW = (f.weight * f.buyScore / 100).toFixed(2)
                return (
                  <tr key={f.factor} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">{f.factor}</td>
                    <td className="py-2.5 text-center tabular-nums">{f.weight}%</td>
                    <td className="py-2.5 text-center tabular-nums">{f.buildScore}</td>
                    <td className="py-2.5 text-center tabular-nums">{f.buyScore}</td>
                    <td className="py-2.5 text-center tabular-nums font-bold">{buildW}</td>
                    <td className="py-2.5 text-center tabular-nums font-bold">{buyW}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td className="py-2.5 font-bold" colSpan={4}>Total Weighted Score</td>
                <td
                  className="py-2.5 text-center font-bold text-sm"
                  style={{ color: totalWeightedBuild >= totalWeightedBuy ? '#378ADD' : 'var(--text-primary)' }}
                >
                  {totalWeightedBuild.toFixed(2)}
                </td>
                <td
                  className="py-2.5 text-center font-bold text-sm"
                  style={{ color: totalWeightedBuy >= totalWeightedBuild ? 'var(--status-green)' : 'var(--text-primary)' }}
                >
                  {totalWeightedBuy.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
          Assumption: Scores are organization-specific assessments. Weights reflect FuzeBox AI priorities. Adjust weights based on your strategic context.
        </div>
      </div>

      {/* Visual score bars */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Score Comparison
        </h3>
        <div className="flex flex-col gap-4">
          {factors.map(f => (
            <div key={f.factor}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {f.factor}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Weight: {f.weight}%
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[9px] mb-0.5" style={{ color: '#378ADD' }}>Build: {f.buildScore}/5</div>
                  <div className="w-full rounded-full" style={{ height: 6, background: 'var(--border)' }}>
                    <div
                      className="rounded-full"
                      style={{ height: 6, width: `${(f.buildScore / 5) * 100}%`, background: '#378ADD', transition: 'width 0.5s' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[9px] mb-0.5" style={{ color: 'var(--status-green)' }}>Buy: {f.buyScore}/5</div>
                  <div className="w-full rounded-full" style={{ height: 6, background: 'var(--border)' }}>
                    <div
                      className="rounded-full"
                      style={{ height: 6, width: `${(f.buyScore / 5) * 100}%`, background: 'var(--status-green)', transition: 'width 0.5s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    Low: { bg: 'var(--status-green-bg)', color: 'var(--status-green)' },
    Medium: { bg: 'rgba(212,175,55,0.1)', color: '#BA7517' },
    High: { bg: 'var(--status-red-bg)', color: 'var(--status-red)' },
  }
  const c = colors[level]
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}
    >
      {level}
    </span>
  )
}
