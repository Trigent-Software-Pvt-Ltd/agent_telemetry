'use client'

import { AlertTriangle, User, CheckCircle, Clock } from 'lucide-react'
import type { Run } from '@/types/telemetry'
import { AUDIT_LOG } from '@/lib/mock-data'

interface FailureEscalationCardProps {
  run: Run
}

/**
 * Shows the escalation chain for a failed run.
 * Matches to the closest audit entry by timestamp proximity (within 2 hours).
 */
export default function FailureEscalationCard({ run }: FailureEscalationCardProps) {
  const failedSpan = run.spans.find(s => s.status === 'error')
  const failedName = failedSpan?.name ?? 'Unknown step'

  // Try to match an audit entry within 2 hours of the run timestamp
  const runTime = new Date(run.timestamp).getTime()
  const TWO_HOURS = 2 * 60 * 60 * 1000

  const matchedAudit = AUDIT_LOG
    .filter(a => {
      const auditTime = new Date(a.timestamp).getTime()
      return Math.abs(auditTime - runTime) < TWO_HOURS
    })
    .sort((a, b) => {
      const da = Math.abs(new Date(a.timestamp).getTime() - runTime)
      const db = Math.abs(new Date(b.timestamp).getTime() - runTime)
      return da - db
    })[0]

  const hasResolution = !!matchedAudit

  return (
    <div className="mt-2 p-3 rounded-lg border border-status-red/20 bg-status-red/5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-status-red" />
        <span className="text-xs font-semibold text-status-red uppercase tracking-wide">
          Failure Escalation
        </span>
      </div>

      {/* Escalation chain */}
      <div className="flex items-start gap-0">
        {/* Step 1: Agent failed */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-status-red/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-status-red" />
          </div>
          <p className="text-[11px] text-text-muted mt-1 text-center max-w-[100px]">
            {failedName} failed
          </p>
        </div>

        {/* Connector */}
        <div className="flex-shrink-0 w-8 h-px bg-border mt-4 self-start" />

        {/* Step 2: Escalated */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-status-amber/10 flex items-center justify-center">
            <User className="w-4 h-4 text-status-amber" />
          </div>
          <p className="text-[11px] text-text-muted mt-1 text-center max-w-[100px]">
            Escalated to human
          </p>
        </div>

        {/* Connector */}
        <div className="flex-shrink-0 w-8 h-px bg-border mt-4 self-start" />

        {/* Step 3: Resolution */}
        <div className="flex flex-col items-center">
          {hasResolution ? (
            <>
              <div className="w-8 h-8 rounded-full bg-status-green/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-status-green" />
              </div>
              <p className="text-[11px] text-text-muted mt-1 text-center max-w-[120px]">
                Resolved by {matchedAudit.reviewer} in {matchedAudit.durationMinutes} min
              </p>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                <Clock className="w-4 h-4 text-status-amber" />
              </div>
              <p className="text-[11px] text-status-amber mt-1 text-center max-w-[120px]">
                Awaiting human review
              </p>
            </>
          )}
        </div>
      </div>

      {/* Resolution detail */}
      {hasResolution && (
        <p className="text-xs text-text-secondary mt-3 pt-2 border-t border-border">
          <span className="font-medium">{matchedAudit.reviewer}</span>:{' '}
          &ldquo;{matchedAudit.humanDecision}&rdquo;
        </p>
      )}
    </div>
  )
}
