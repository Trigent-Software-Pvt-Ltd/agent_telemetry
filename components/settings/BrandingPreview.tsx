'use client'

import { LayoutDashboard, Workflow, GitCompare, FileText, Settings } from 'lucide-react'
import type { BrandingConfig } from './BrandingForm'

interface BrandingPreviewProps {
  config: BrandingConfig
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, active: true },
  { name: 'Workflows', icon: Workflow, active: false },
  { name: 'Compare', icon: GitCompare, active: false },
  { name: 'Reports', icon: FileText, active: false },
  { name: 'Settings', icon: Settings, active: false },
]

export function BrandingPreview({ config }: BrandingPreviewProps) {
  return (
    <div className="card flex flex-col gap-6">
      <h2
        className="text-xs font-semibold uppercase"
        style={{ color: '#64748B', letterSpacing: '0.08em' }}
      >
        Live Preview
      </h2>

      {/* Mini sidebar preview */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: '#0A1628' }}>
          Sidebar Preview
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: config.secondaryColor, width: '100%', maxWidth: 220 }}
        >
          {/* Logo area */}
          <div className="px-4 py-4 flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold overflow-hidden"
              style={{ background: config.primaryColor, color: config.secondaryColor }}
            >
              {config.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontSize: 14 }}>&#9670;</span>
              )}
            </div>
            <div>
              <div className="text-white text-xs font-bold font-[var(--font-sora)]">
                {config.companyName || 'Company'}
              </div>
              <div className="text-[9px]" style={{ color: '#94A3B8' }}>
                {config.subtitle || 'Subtitle'}
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div className="px-1 pb-3">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md"
                  style={{
                    color: item.active ? config.primaryColor : '#94A3B8',
                    background: item.active ? `${config.primaryColor}15` : 'transparent',
                    borderLeft: item.active
                      ? `2px solid ${config.primaryColor}`
                      : '2px solid transparent',
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  <Icon size={14} />
                  {item.name}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mini report header preview */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: '#0A1628' }}>
          Report Header Preview
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: config.secondaryColor }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold overflow-hidden"
              style={{ background: config.primaryColor, color: config.secondaryColor }}
            >
              {config.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontSize: 16 }}>&#9670;</span>
              )}
            </div>
            <div>
              <div className="text-white text-sm font-bold font-[var(--font-sora)]">
                {config.companyName || 'Company'}
              </div>
              <div className="text-[10px]" style={{ color: '#94A3B8' }}>
                {config.subtitle || 'Subtitle'}
              </div>
            </div>
          </div>
          <div className="px-4 py-3" style={{ background: '#FFFFFF' }}>
            <div className="text-xs font-semibold" style={{ color: '#0A1628' }}>
              Agent Performance Report
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>
              Weekly summary &middot; {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div
            className="px-4 py-2 text-[9px]"
            style={{ background: '#F7F9FC', color: '#64748B', borderTop: '1px solid #E2E8F0' }}
          >
            {config.reportFooter || 'Report footer text'}
          </div>
        </div>
      </div>
    </div>
  )
}
