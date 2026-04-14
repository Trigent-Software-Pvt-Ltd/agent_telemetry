import type { Metadata } from 'next'
import PromptRegistryView from '@/components/quadrant/PromptRegistryView'
import { PROMPT_VERSIONS } from '@/lib/quadrant-mock'

export const metadata: Metadata = { title: 'Prompt Registry' }

export default function Page() {
  return <PromptRegistryView versions={PROMPT_VERSIONS} />
}
