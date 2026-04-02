'use client'

import { useState } from 'react'
import type { ComplianceRequirement } from '@/types/telemetry'
import { Award, Download, X } from 'lucide-react'

interface ComplianceCertificateProps {
  score: number
  requirements: ComplianceRequirement[]
}

export function ComplianceCertificate({ score, requirements }: ComplianceCertificateProps) {
  const [open, setOpen] = useState(false)

  const passed = requirements.filter(r => r.status === 'PASS').length
  const partial = requirements.filter(r => r.status === 'PARTIAL').length
  const notStarted = requirements.filter(r => r.status === 'NOT_STARTED').length
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
        style={{ background: 'var(--vip-gold)', color: '#FFFFFF' }}
      >
        <Award size={16} />
        Generate Certificate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:bg-white print:static">
          <div
            className="relative w-full max-w-2xl mx-4 rounded-2xl shadow-2xl print:shadow-none print:max-w-none"
            style={{ background: '#FFFFFF' }}
          >
            {/* Close button (hidden in print) */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 cursor-pointer print:hidden"
            >
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Certificate content */}
            <div className="p-10 text-center">
              {/* Border decoration */}
              <div
                className="rounded-xl p-8"
                style={{ border: '3px solid var(--vip-gold)', background: 'linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 100%)' }}
              >
                <div className="mb-2">
                  <Award size={48} style={{ color: 'var(--vip-gold)', margin: '0 auto' }} />
                </div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-sora)', color: 'var(--vip-navy)' }}
                >
                  AI Compliance Certificate
                </h2>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                  ISO 42001 / EU AI Act Readiness Assessment
                </p>

                <div className="mb-6">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Issued to</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--vip-navy)', fontFamily: 'var(--font-sora)' }}>
                    r-Potential (FuzeBox AI)
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Audit Readiness Score</p>
                  <p className="text-4xl font-bold tabular-nums" style={{ color: 'var(--vip-gold)', fontFamily: 'var(--font-sora)' }}>
                    {score}%
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg p-3" style={{ background: 'var(--status-green-bg)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--status-green)' }}>{passed}</p>
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--status-green)' }}>PASSED</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--status-amber-bg)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--status-amber)' }}>{partial}</p>
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--status-amber)' }}>PARTIAL</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--status-red-bg)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--status-red)' }}>{notStarted}</p>
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--status-red)' }}>NOT STARTED</p>
                  </div>
                </div>

                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Date of assessment: {today}
                </p>
              </div>
            </div>

            {/* Download button (hidden in print) */}
            <div className="flex justify-center pb-6 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                style={{ background: 'var(--vip-navy)', color: '#FFFFFF' }}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
