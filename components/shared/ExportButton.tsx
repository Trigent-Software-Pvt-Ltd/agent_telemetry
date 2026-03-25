'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function ExportButton({ label = 'Export Report' }: { label?: string }) {
  return (
    <button
      onClick={() => toast.info('Export will be available in the production build — this is your preview.')}
      className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all cursor-pointer"
      style={{
        background: '#D4AF37',
        color: '#0A1628',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#A8891A'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#D4AF37'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Download size={16} />
      {label}
    </button>
  )
}
