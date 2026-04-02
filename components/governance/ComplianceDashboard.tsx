'use client'

import { getComplianceRequirements, getEvidenceChains, getAuditReadinessScore } from '@/lib/mock-data'
import { ComplianceChecklist } from './ComplianceChecklist'
import { EvidenceChain } from './EvidenceChain'
import { ComplianceCertificate } from './ComplianceCertificate'
import { ShieldCheck } from 'lucide-react'

export function ComplianceDashboard() {
  const requirements = getComplianceRequirements()
  const chains = getEvidenceChains()
  const score = getAuditReadinessScore()

  const radius = 64
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const color = score >= 85 ? 'var(--status-green)' : score >= 70 ? 'var(--status-amber)' : 'var(--status-red)'

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} style={{ color: 'var(--vip-gold)' }} />
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
            Compliance & Certification
          </h1>
        </div>
        <ComplianceCertificate score={score} requirements={requirements} />
      </div>

      {/* Hero gauge */}
      <div className="card flex items-center gap-6">
        <div className="relative" style={{ width: 150, height: 150 }}>
          <svg width={150} height={150} viewBox="0 0 150 150">
            <circle
              cx={75} cy={75} r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={10}
            />
            <circle
              cx={75} cy={75} r={radius}
              fill="none"
              stroke={color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-[var(--font-sora)] tabular-nums" style={{ color }}>
              {score}%
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              audit ready
            </span>
          </div>
        </div>
        <div>
          <div className="text-lg font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
            Audit Readiness: {score}%
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {requirements.filter(r => r.status === 'PASS').length} of {requirements.length} requirements fully met.{' '}
            {requirements.filter(r => r.status === 'NOT_STARTED').length > 0 &&
              `${requirements.filter(r => r.status === 'NOT_STARTED').length} not yet started.`}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <ComplianceChecklist requirements={requirements} />

      {/* Evidence chain */}
      <EvidenceChain chains={chains} />
    </div>
  )
}
