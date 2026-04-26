'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { AEOSTenantId, DemoBeat, DemoState } from '@/types/aeos'

interface AEOSDemoContextShape extends DemoState {
  tenantId: AEOSTenantId
  setTenantId: (id: AEOSTenantId) => void
  start: () => void
  pause: () => void
  reset: () => void
  setBeat: (b: DemoBeat) => void
  // Highlights driven by orchestrator beats — pages can read these
  pulseDecisionFeed: boolean
  highlightPatch: boolean
  highlightPolicy: boolean
}

const AEOSDemoContext = createContext<AEOSDemoContextShape | null>(null)

// 90-second narrative beats (per docs/AEOS/.../narrative-flow.md)
const BEAT_TIMELINE: Array<{ at: number; beat: DemoBeat; route?: string; toast?: { title: string; sub?: string; type?: 'info' | 'success' | 'warn' } }> = [
  { at: 0, beat: 'opening', route: '/', toast: { title: 'AEOS · Mission Control', sub: 'Coverage manifest verified · two-party attestation active', type: 'success' } },
  { at: 12_000, beat: 'injecting', toast: { title: 'New high-risk task arriving', sub: 'Brake-diagnosis ticket from service bay', type: 'info' } },
  { at: 22_000, beat: 'exploring', toast: { title: 'Routing through UEF', sub: '8 dimensions × 3 candidate paths · GSTI / UoP / Coordination Tax from rPotential', type: 'info' } },
  { at: 36_000, beat: 'patching', toast: { title: 'L9 DIR fired', sub: '2 rules: safety_relevant_confirmation + auto_safety_tool_lockdown', type: 'warn' } },
  { at: 50_000, beat: 'policy', toast: { title: 'Policy ALLOW · EU AI Act Article 12 trail recorded', sub: '4 required controls enforced before vendor invocation', type: 'success' } },
  { at: 64_000, beat: 'signing', toast: { title: 'Bundle signed', sub: 'FuzeBox ed25519 + rPotential HMAC-SHA256 · single-party signatures structurally refused', type: 'success' } },
  { at: 78_000, beat: 'zoomed', route: '/eai', toast: { title: 'Every point on this chart is signed by both parties', sub: 'EAI trending ↑ — 3 inflection points where DIR rules were synthesized', type: 'success' } },
  { at: 90_000, beat: 'done', toast: { title: 'Demo complete', sub: 'Reset to replay', type: 'success' } },
]

export function AEOSDemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [tenantId, setTenantId] = useState<AEOSTenantId>('kengarff_automotive')
  const [beat, setBeat] = useState<DemoBeat>('idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }

  const start = useCallback(() => {
    clearTimers()
    setIsPlaying(true)
    setStartedAt(new Date().toISOString())

    BEAT_TIMELINE.forEach(step => {
      const t = setTimeout(() => {
        setBeat(step.beat)
        if (step.route) router.push(step.route)
        if (step.toast) {
          const fn = step.toast.type === 'warn' ? toast.warning : step.toast.type === 'success' ? toast.success : toast.info
          fn(step.toast.title, { description: step.toast.sub, duration: 6000 })
        }
        // After 'exploring' beat, navigate into a representative decision
        if (step.beat === 'exploring') {
          // Use a stable deterministic decision for the kengarff brake skill
          // Defer slightly so the toast lands first
          setTimeout(() => {
            void navigateToFeaturedDecision(router)
          }, 800)
        }
        if (step.beat === 'done') {
          setIsPlaying(false)
        }
      }, step.at)
      timersRef.current.push(t)
    })
  }, [router])

  const pause = useCallback(() => {
    clearTimers()
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setIsPlaying(false)
    setBeat('idle')
    setStartedAt(null)
    router.push('/')
  }, [router])

  useEffect(() => () => clearTimers(), [])

  return (
    <AEOSDemoContext.Provider
      value={{
        tenantId,
        setTenantId,
        beat,
        isPlaying,
        startedAt,
        scenarioId: 'brake_diagnosis_v1',
        playbackSpeed: 1,
        start,
        pause,
        reset,
        setBeat,
        pulseDecisionFeed: beat === 'injecting',
        highlightPatch: beat === 'patching' || beat === 'policy',
        highlightPolicy: beat === 'policy' || beat === 'signing',
      }}
    >
      {children}
    </AEOSDemoContext.Provider>
  )
}

async function navigateToFeaturedDecision(router: ReturnType<typeof useRouter>) {
  // Pull a recent kengarff decision for the brake skill from the data layer
  const { listRecentDecisions } = await import('@/lib/aeos/data')
  const recent = listRecentDecisions('kengarff_automotive', 30)
  const featured =
    recent.find(d => d.skill_id === 'skill_brake_diag_v3' && d.applied_patch && d.applied_patch.rules_fired.length >= 2) ??
    recent.find(d => d.skill_id === 'skill_brake_diag_v3') ??
    recent[0]
  if (featured) router.push(`/decisions/${featured.decision_id}`)
}

export function useAEOSDemo() {
  const ctx = useContext(AEOSDemoContext)
  if (!ctx) throw new Error('useAEOSDemo must be used within AEOSDemoProvider')
  return ctx
}
