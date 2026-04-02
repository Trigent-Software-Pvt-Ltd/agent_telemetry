'use client'

import { getMaturityDimensions, getMaturityScore, MATURITY_LEVELS } from '@/lib/mock-data'
import MaturityRadar from './MaturityRadar'

export default function MaturityScore() {
  const dimensions = getMaturityDimensions()
  const score = getMaturityScore()
  const currentLevel = MATURITY_LEVELS.find(l => l.level === score) ?? MATURITY_LEVELS[2]
  const nextLevel = MATURITY_LEVELS.find(l => l.level === score + 1)

  // Find weakest dimension
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Hero: Current Level */}
      <div
        className="card animate-fade-up"
        style={{ border: '1px solid #378ADD', background: 'rgba(55, 138, 221, 0.04)' }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          AI Maturity Assessment
        </div>
        <div
          className="text-2xl font-bold"
          style={{ color: '#378ADD', fontFamily: 'var(--font-sora)' }}
        >
          Level {score}: {currentLevel.name}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {currentLevel.description}
        </p>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-2">
          {MATURITY_LEVELS.map(level => {
            const isActive = level.level <= score
            const isCurrent = level.level === score
            return (
              <div key={level.level} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-full"
                  style={{
                    height: 8,
                    background: isActive ? '#378ADD' : 'var(--border)',
                    border: isCurrent ? '2px solid #0A1628' : 'none',
                    transition: 'all 0.3s',
                  }}
                />
                <div
                  className="text-[9px] font-semibold"
                  style={{ color: isActive ? '#378ADD' : 'var(--text-muted)' }}
                >
                  L{level.level}
                </div>
                <div
                  className="text-[8px] leading-tight text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {level.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Radar chart + CEO insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
          >
            Dimension Scores
          </h3>
          <MaturityRadar dimensions={dimensions} />
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              Path to Next Level
            </h3>
            {nextLevel && (
              <div
                className="p-3 rounded-lg mb-4"
                style={{ background: 'var(--status-green-bg)', border: '1px solid rgba(29,158,117,0.15)' }}
              >
                <div className="text-xs font-bold" style={{ color: 'var(--status-green)' }}>
                  Target: Level {nextLevel.level} — {nextLevel.name}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {nextLevel.description}
                </div>
              </div>
            )}
            <div
              className="text-xs p-3 rounded-lg"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>CEO Reads:</span>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                To reach Level {score + 1} ({nextLevel?.name ?? 'Autonomous'}), focus on{' '}
                <strong>{weakest.dimension}</strong>: {weakest.action.toLowerCase()}.
              </span>
            </div>
          </div>
          <div className="mt-3 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
            Assumption: Maturity scores are self-assessed based on current platform data. Independent audit recommended for formal scoring.
          </div>
        </div>
      </div>

      {/* Per-dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map(d => {
          const statusColor = d.score >= 4 ? 'var(--status-green)' : d.score >= 3 ? '#D4AF37' : 'var(--status-red)'
          const statusBg = d.score >= 4 ? 'var(--status-green-bg)' : d.score >= 3 ? 'rgba(212,175,55,0.08)' : 'var(--status-red-bg)'
          return (
            <div key={d.dimension} className="card" style={{ border: `1px solid ${statusColor}20` }}>
              <div className="flex items-center justify-between mb-2">
                <h4
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {d.dimension}
                </h4>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{ background: statusBg, color: statusColor }}
                >
                  {d.score}/5
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full rounded-full mb-3" style={{ height: 6, background: 'var(--border)' }}>
                <div
                  className="rounded-full"
                  style={{ height: 6, width: `${(d.score / 5) * 100}%`, background: statusColor, transition: 'width 0.5s' }}
                />
              </div>

              <div className="text-[10px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold">Next level:</span> {d.nextLevel}
              </div>
              <div className="text-[10px]" style={{ color: '#378ADD' }}>
                <span className="font-semibold">Action:</span> {d.action}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
