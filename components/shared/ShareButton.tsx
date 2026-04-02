'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'
import { toast } from 'sonner'

type AccessLevel = 'anyone' | 'team' | 'admins'
type Expiry = '7' | '30' | 'never'

interface ShareButtonProps {
  pageName?: string
}

export function ShareButton({ pageName = 'this page' }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [access, setAccess] = useState<AccessLevel>('anyone')
  const [expiry, setExpiry] = useState<Expiry>('7')
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const shareUrl = `https://vipplay.app/share/${Math.random().toString(36).slice(2, 8)}`

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const accessOptions: { value: AccessLevel; label: string }[] = [
    { value: 'anyone', label: 'Anyone with link' },
    { value: 'team', label: 'Team members only' },
    { value: 'admins', label: 'Admins only' },
  ]

  const expiryOptions: { value: Expiry; label: string }[] = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: 'never', label: 'Never' },
  ]

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer"
        style={{
          background: open ? '#E8EEF5' : 'transparent',
          color: '#64748B',
          border: '1px solid',
          borderColor: open ? '#D4AF37' : '#E2E8F0',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = '#D4AF37'
            e.currentTarget.style.color = '#D4AF37'
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = '#E2E8F0'
            e.currentTarget.style.color = '#64748B'
          }
        }}
        title={`Share ${pageName}`}
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 z-50 animate-fade-up"
          style={{
            width: 340,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(10,22,40,0.12)',
            padding: '20px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Share {pageName}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded flex items-center justify-center cursor-pointer"
              style={{ color: '#94A3B8' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Link + Copy */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-[var(--font-mono-jb)] truncate"
              style={{
                background: '#F7F9FC',
                border: '1px solid #E2E8F0',
                color: '#0A1628',
              }}
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{
                background: copied ? '#ECFDF5' : '#D4AF37',
                color: copied ? '#059669' : '#0A1628',
                border: copied ? '1px solid #059669' : '1px solid transparent',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Access Control */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase block mb-2" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Access
            </label>
            <div className="space-y-1.5">
              {accessOptions.map(opt => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: access === opt.value ? '#FBF5DC' : 'transparent',
                    border: '1px solid',
                    borderColor: access === opt.value ? '#D4AF37' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="share-access"
                    value={opt.value}
                    checked={access === opt.value}
                    onChange={() => setAccess(opt.value)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-sm" style={{ color: '#0A1628' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-xs font-semibold uppercase block mb-2" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Expires
            </label>
            <select
              value={expiry}
              onChange={e => setExpiry(e.target.value as Expiry)}
              className="w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              style={{
                background: '#F7F9FC',
                border: '1px solid #E2E8F0',
                color: '#0A1628',
              }}
            >
              {expiryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
