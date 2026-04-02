'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 600)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: '#378ADD', color: '#FFFFFF' }}
            >
              rP
            </div>
            <div className="text-left">
              <div className="text-lg font-bold font-[var(--font-sora)]" style={{ color: '#111827' }}>
                r-Potential
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>
                Powered by FuzeBox
              </div>
            </div>
          </div>
          <p className="text-sm mt-4" style={{ color: '#6B7280' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: '#374151' }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              defaultValue=""
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #E8E6E0',
                color: '#111827',
                background: '#FFFFFF',
              }}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#E8E6E0')}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: '#374151' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              defaultValue=""
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #E8E6E0',
                color: '#111827',
                background: '#FFFFFF',
              }}
              onFocus={e => (e.target.style.borderColor = '#378ADD')}
              onBlur={e => (e.target.style.borderColor = '#E8E6E0')}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <button type="button" className="text-sm font-medium hover:underline cursor-pointer" style={{ color: '#378ADD' }}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-70"
            style={{ background: '#378ADD' }}
            onMouseEnter={e => {
              if (!loading) (e.target as HTMLButtonElement).style.background = '#2B6FB8'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = '#378ADD'
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid #E8E6E0' }}>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Agent Quality & Process ROI Platform
          </p>
        </div>
      </div>
    </div>
  )
}
