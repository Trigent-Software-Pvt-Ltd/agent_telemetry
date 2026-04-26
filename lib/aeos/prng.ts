// Deterministic PRNG so the demo reproduces exactly.
// mulberry32 — seed once with 20260420 (the AEOS reference seed) for stable output.

export function mulberry32(seed: number) {
  let t = seed >>> 0
  return function rand(): number {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted<T>(rand: () => number, items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((s, it) => s + it.weight, 0)
  let r = rand() * total
  for (const it of items) {
    r -= it.weight
    if (r <= 0) return it.value
  }
  return items[items.length - 1].value
}

export function pickOne<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min)
}

export function rangeInt(rand: () => number, min: number, max: number): number {
  return Math.floor(min + rand() * (max - min + 1))
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// Stable hex for mock signatures
export function mockHex(rand: () => number, len = 64): string {
  let s = ''
  for (let i = 0; i < len; i++) s += Math.floor(rand() * 16).toString(16)
  return s
}

export function mockId(rand: () => number, prefix: string, len = 12): string {
  let s = prefix + '_'
  const chars = '0123456789abcdef'
  for (let i = 0; i < len; i++) s += chars[Math.floor(rand() * chars.length)]
  return s
}

export const AEOS_SEED = 20260420
