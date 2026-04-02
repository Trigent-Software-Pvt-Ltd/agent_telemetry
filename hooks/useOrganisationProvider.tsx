'use client'

import { useState, type ReactNode } from 'react'
import { OrganisationContext } from './useOrganisation'
import type { QualityFramework } from '@/types/telemetry'

export function OrganisationProvider({ children }: { children: ReactNode }) {
  const [qualityFramework, setQualityFramework] = useState<QualityFramework>('oee')

  return (
    <OrganisationContext value={{ qualityFramework, setQualityFramework }}>
      {children}
    </OrganisationContext>
  )
}
