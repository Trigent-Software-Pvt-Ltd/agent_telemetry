'use client'

import { useState } from 'react'
import { getSharedLinks, SharedLink } from '@/lib/mock-data'
import { Link2, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const accessLabels: Record<string, string> = {
  anyone: 'Anyone with link',
  team: 'Team members only',
  admins: 'Admins only',
}

const accessColors: Record<string, { bg: string; text: string }> = {
  anyone: { bg: '#ECFDF5', text: '#059669' },
  team: { bg: '#FBF5DC', text: '#A8891A' },
  admins: { bg: '#FFF5F5', text: '#DC2626' },
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function SharedLinksTable() {
  const [links, setLinks] = useState<SharedLink[]>(getSharedLinks)

  const handleRevoke = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, revoked: true } : l))
    toast.success('Share link revoked')
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Link2 size={16} style={{ color: '#D4AF37' }} />
        <h2 className="text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Shared Links
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              {['Link', 'Page', 'Access', 'Created', 'Expires', 'Actions'].map(h => (
                <th
                  key={h}
                  className="text-left py-2 px-3 text-[10px] font-semibold uppercase"
                  style={{ color: '#94A3B8', letterSpacing: '0.08em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map(link => {
              const ac = accessColors[link.access]
              return (
                <tr
                  key={link.id}
                  className="row-hover"
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    opacity: link.revoked ? 0.5 : 1,
                  }}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-[var(--font-mono-jb)] truncate"
                        style={{ color: '#0A1628', maxWidth: 180 }}
                      >
                        {link.url}
                      </span>
                      <ExternalLink size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#0A1628' }}>
                    {link.page}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                      style={{ background: ac.bg, color: ac.text, letterSpacing: '0.04em' }}
                    >
                      {accessLabels[link.access]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>
                    {formatDate(link.createdAt)}
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>
                    {formatDate(link.expiresAt)}
                  </td>
                  <td className="py-2.5 px-3">
                    {link.revoked ? (
                      <span className="text-[10px] font-semibold uppercase" style={{ color: '#DC2626' }}>
                        Revoked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevoke(link.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
                        style={{ color: '#DC2626' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#991B1B')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#DC2626')}
                      >
                        <Trash2 size={13} />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
