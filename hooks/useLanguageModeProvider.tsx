'use client'

import { useState, type ReactNode } from 'react'
import { LanguageModeContext } from './useLanguageMode'
import type { LanguageMode } from '@/types/telemetry'

export function LanguageModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LanguageMode>('operations')

  return (
    <LanguageModeContext value={{ mode, setMode }}>
      {children}
    </LanguageModeContext>
  )
}
