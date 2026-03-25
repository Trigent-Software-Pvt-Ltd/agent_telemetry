# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Telemetry — a Next.js 16 application for agentic observation/telemetry. Currently at scaffold stage (Create Next App).

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript presets)

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and TypeScript
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Geist** font family (Sans + Mono via `next/font/google`)
- Path alias: `@/*` maps to project root

## Next.js 16 Breaking Changes

This version has breaking changes from training data. **Read `node_modules/next/dist/docs/` before writing code.** Key differences:

- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- Use `proxy.ts` instead of `middleware.ts` (Node.js runtime only). Place at same level as `app/`.
- Turbopack config is top-level in `next.config.ts`, not under `experimental.turbopack`
- `'use cache'` replaces PPR for mixing static and dynamic content
- `@vercel/postgres` and `@vercel/kv` are sunset — use `@neondatabase/serverless` and `@upstash/redis`

## Architecture

- `app/layout.tsx` — Root layout with Geist fonts and global CSS
- `app/page.tsx` — Home page (Server Component)
- `app/globals.css` — Tailwind imports and CSS variables
- `next.config.ts` — Empty config (defaults)
- `eslint.config.mjs` — Flat ESLint config with Next.js core-web-vitals and TypeScript rules
