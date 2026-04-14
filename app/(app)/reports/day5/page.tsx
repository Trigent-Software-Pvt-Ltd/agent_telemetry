import type { Metadata } from 'next'
import Day5ReportView from '@/components/quadrant/Day5ReportView'
import { getDay5ReportData } from '@/lib/quadrant-mock'

export const metadata: Metadata = { title: 'Day-5 Decision Report' }

export default function Page() {
  const data = getDay5ReportData()
  return <Day5ReportView data={data} />
}
