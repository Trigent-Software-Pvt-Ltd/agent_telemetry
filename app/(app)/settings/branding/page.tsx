'use client'

import { useState } from 'react'
import { BrandingForm, BRANDING_DEFAULTS } from '@/components/settings/BrandingForm'
import type { BrandingConfig } from '@/components/settings/BrandingForm'
import { BrandingPreview } from '@/components/settings/BrandingPreview'
import { toast } from 'sonner'

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>({ ...BRANDING_DEFAULTS })

  const handleApply = () => {
    toast.success('Branding updated')
  }

  const handleReset = () => {
    setConfig({ ...BRANDING_DEFAULTS })
    toast.info('Branding reset to defaults')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="text-xl font-bold font-[var(--font-sora)]"
        style={{ color: '#0A1628' }}
      >
        Branding &amp; White-Label
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <BrandingForm
          config={config}
          onChange={setConfig}
          onApply={handleApply}
          onReset={handleReset}
        />
        <BrandingPreview config={config} />
      </div>
    </div>
  )
}
