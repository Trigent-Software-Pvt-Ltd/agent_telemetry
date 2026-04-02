import { redirect } from 'next/navigation'

export default async function LaborGraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/process/${id}/coverage`)
}
