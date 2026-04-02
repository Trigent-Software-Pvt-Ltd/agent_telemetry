'use client'

import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

const RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    title: 'Close the sigma gap',
    description: '+0.9\u03C3 needed to reach top 10%. Focus on reducing variance in the Recommendation Writer and Line Comparison agents.',
    impact: 'High',
    color: '#D4AF37',
    bg: '#FBF5DC',
  },
  {
    icon: DollarSign,
    title: 'Cost optimization',
    description: 'Reduce per-run cost by 33% to match leaders. Migrate remaining gpt-4o workflows to Claude Sonnet for immediate savings.',
    impact: 'Medium',
    color: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    icon: BarChart3,
    title: 'Scale coverage',
    description: 'Increase agent coverage from 43% to industry leader 68%. Prioritise VIP Support and Content Moderation for next rollout.',
    impact: 'High',
    color: '#059669',
    bg: '#ECFDF5',
  },
]

export function BenchmarkRecommendations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {RECOMMENDATIONS.map((rec) => {
        const Icon = rec.icon
        return (
          <div key={rec.title} className="card animate-fade-up">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: rec.bg }}
              >
                <Icon size={18} style={{ color: rec.color }} />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                  {rec.title}
                </h4>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  style={{
                    background: rec.impact === 'High' ? '#FFF5F5' : '#FFFBEB',
                    color: rec.impact === 'High' ? '#DC2626' : '#D97706',
                    letterSpacing: '0.05em',
                  }}
                >
                  {rec.impact} Impact
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              {rec.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
