import { PROCESSES, AGENTS, ROI_SNAPSHOTS, ORGANISATION } from '@/lib/mock-data'

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function HeroBanner() {
  const agentCount = AGENTS.length
  const processCount = PROCESSES.length
  const weeklyNetRoi = ROI_SNAPSHOTS.reduce((sum, s) => sum + s.netRoiWeekly, 0)
  const sigmaTarget = ORGANISATION.sigmaTarget

  // Compute the 4 key messages
  const avgSigma = AGENTS.reduce((sum, a) => sum + a.sigmaScore, 0) / AGENTS.length
  const totalAutomationPct = Math.round(
    PROCESSES.reduce((sum, p) => sum + p.agentCoverage * 100, 0) / PROCESSES.length
  )
  const agentsAboveTarget = AGENTS.filter((a) => a.sigmaScore >= sigmaTarget).length

  return (
    <div
      className="card relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1A2744 100%)',
        border: 'none',
      }}
    >
      {/* Decorative accent line */}
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #378ADD 100%)' }}
      />

      <div className="flex flex-col gap-4 py-2">
        {/* Headline */}
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-sora)', color: '#FFFFFF' }}
          >
            Your AI Workforce
          </h1>
          <p className="mt-1.5 text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {agentCount} AI agents working across {processCount} job role{processCount !== 1 ? 's' : ''}, saving{' '}
            <span className="font-semibold" style={{ color: '#D4AF37' }}>
              {formatCurrency(weeklyNetRoi)}/week
            </span>{' '}
            after all costs.
          </p>
        </div>

        {/* Four key messages */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HeroPill
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Quality"
            value={`${avgSigma.toFixed(1)}σ avg`}
            detail={`${agentsAboveTarget}/${agentCount} at target`}
          />
          <HeroPill
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="8" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                <rect x="6.5" y="5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                <rect x="11" y="2" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            }
            label="Workforce"
            value={`${totalAutomationPct}% automated`}
            detail={`across ${processCount} roles`}
          />
          <HeroPill
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1v14M4.5 4C4.5 2.9 6 2 8 2s3.5.9 3.5 2S10 6 8 6 4.5 5.1 4.5 4zM11.5 8c0 1.1-1.5 2-3.5 2S4.5 9.1 4.5 8M11.5 12c0 1.1-1.5 2-3.5 2s-3.5-.9-3.5-2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            }
            label="Finance"
            value={`${formatCurrency(weeklyNetRoi)}/wk`}
            detail="net of all costs"
          />
          <HeroPill
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 5L6.5 11.5L3 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Compliance"
            value="Audit active"
            detail="governance trail on"
          />
        </div>
      </div>
    </div>
  )
}

function HeroPill({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: '#FFFFFF', fontFamily: 'var(--font-sora)' }}
        >
          {value}
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {detail}
        </span>
      </div>
    </div>
  )
}
