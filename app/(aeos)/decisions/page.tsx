import { redirect } from 'next/navigation'
import { listRecentDecisions } from '@/lib/aeos/data'

export default function DecisionsIndexPage() {
  // Redirect to the most recent decision for the default tenant
  const recent = listRecentDecisions('kengarff_automotive', 1)
  if (recent[0]) redirect(`/decisions/${recent[0].decision_id}`)
  return <div>No decisions yet.</div>
}
