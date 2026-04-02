'use client'

import type { EvidenceChainItem } from '@/types/telemetry'
import { Bot, User, CheckCircle2, ArrowRight } from 'lucide-react'

interface EvidenceChainProps {
  chains: EvidenceChainItem[]
}

export function EvidenceChain({ chains }: EvidenceChainProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: 'var(--vip-navy)' }}>
        Human-in-the-Loop Evidence Chain
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        For each high-risk task: Task &rarr; Agent decision &rarr; Human review &rarr; Outcome
      </p>
      <div className="flex flex-col gap-4">
        {chains.map((chain, i) => (
          <div
            key={i}
            className="rounded-lg p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {chain.task}
            </p>
            <div className="flex flex-col gap-2">
              {/* Agent Decision */}
              <div className="flex items-start gap-2">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--status-amber-bg)' }}
                >
                  <Bot size={12} style={{ color: 'var(--status-amber)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--status-amber)' }}>Agent Decision</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{chain.agentDecision}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Human Review */}
              <div className="flex items-start gap-2">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--vip-navy-100, #E8EDF5)' }}
                >
                  <User size={12} style={{ color: 'var(--vip-navy)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--vip-navy)' }}>Human Review</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{chain.humanReview}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Outcome */}
              <div className="flex items-start gap-2">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--status-green-bg)' }}
                >
                  <CheckCircle2 size={12} style={{ color: 'var(--status-green)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--status-green)' }}>Outcome</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{chain.outcome}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
