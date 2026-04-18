-- Quadrant Sourcing Agent — Supabase schema
-- Apply via Supabase Studio SQL editor or psql.
-- Service-role key bypasses RLS; no RLS policies are defined here.

create table if not exists public.quadrant_sourcing_runs (
  id text primary key,
  triggered_by text not null,
  triggered_at timestamptz not null default now(),
  trigger text not null,
  input_brief text,
  steps jsonb not null default '[]'::jsonb,
  evidence_validated_count int not null default 0,
  evaluation_surfaced_count int not null default 0,
  total_cost_usd numeric(12, 6) not null default 0,
  total_latency_ms int not null default 0,
  prompt_version text,
  created_at timestamptz not null default now()
);

create index if not exists quadrant_sourcing_runs_triggered_at_idx
  on public.quadrant_sourcing_runs (triggered_at desc);

create table if not exists public.quadrant_sourcing_candidates (
  id text primary key,
  run_id text not null references public.quadrant_sourcing_runs(id) on delete cascade,
  company_name text not null,
  npi text,
  taxonomy_code text,
  taxonomy_label text,
  service_category text,
  geography_state text,
  geography_metro text,
  medicare_revenue numeric,
  medicare_pct_assumption numeric,
  extrapolated_total_revenue numeric,
  revenue_confidence_band jsonb,
  is_third_party boolean,
  revenue_over_5m boolean,
  overall_confidence numeric,
  evidence jsonb not null default '[]'::jsonb,
  thesis_fit jsonb,
  disqualifiers jsonb,
  fit_state text not null default 'unreviewed',
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists quadrant_sourcing_candidates_run_id_idx
  on public.quadrant_sourcing_candidates (run_id);
