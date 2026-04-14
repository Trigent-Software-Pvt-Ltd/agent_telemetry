import type { Metadata } from 'next'
import ChiefOfStaffView from '@/components/quadrant/ChiefOfStaffView'
import {
  QUADRANT_AGENTS,
  getMorningRitualStats,
  getCardBreakdownByUser,
  getOutlookDraftLifecycle,
  getActionRate,
  getBriefingsForUser,
  QUADRANT_USERS,
} from '@/lib/quadrant-mock'

export const metadata: Metadata = { title: 'Chief of Staff' }

export default function Page() {
  const agent = QUADRANT_AGENTS.find(a => a.id === 'chief-of-staff')!
  const ritual = getMorningRitualStats()
  const cardBreakdown = getCardBreakdownByUser()
  const draftLifecycle = getOutlookDraftLifecycle()
  const overallAction = getActionRate('all')
  const briefings = getBriefingsForUser('all')

  return (
    <ChiefOfStaffView
      agent={agent}
      users={QUADRANT_USERS}
      ritual={ritual}
      cardBreakdown={cardBreakdown}
      draftLifecycle={draftLifecycle}
      overallAction={overallAction}
      briefings={briefings}
    />
  )
}
