import type { Metadata } from 'next'
import ProductionReadinessView from './view'

export const metadata: Metadata = { title: 'Production Readiness' }

export default function Page() {
  return <ProductionReadinessView />
}
