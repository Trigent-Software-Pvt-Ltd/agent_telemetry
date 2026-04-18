-- Quadrant Live Sourcing Agent — isolated schema & role.
--
-- This migration intentionally does NOT reuse the existing
-- supabase/service_role/anon/authenticated roles. It creates a dedicated
-- Postgres role `quadrant_app` that owns and can access only the
-- `quadrant` schema. PostgREST, GoTrue, Kong, and the Supabase auth
-- layer are all bypassed — the application connects directly over
-- Postgres wire protocol using QUADRANT_DB_URL.
--
-- BEFORE RUNNING:
--   1. Replace <CHANGEME_QUADRANT_APP_PASSWORD> with the password that
--      matches your local .env.local (QUADRANT_DB_URL).
--   2. Apply via Supabase Studio SQL editor OR psql as a superuser:
--        psql "postgres://postgres:<superpw>@arkosdb.trigent.com:5432/postgres" \
--          -f supabase/migrations/20260418_quadrant_schema.sql
--
-- ROLLBACK:
--   drop schema quadrant cascade;
--   drop role quadrant_app;

-- 1. Dedicated schema
create schema if not exists quadrant;

-- 2. Dedicated login role — NOT anon/authenticated/service_role.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'quadrant_app') then
    create role quadrant_app with login password '<CHANGEME_QUADRANT_APP_PASSWORD>';
  end if;
end
$$;

-- 3. Tables
create table if not exists quadrant.sourcing_runs (
  id                        text primary key,
  triggered_by              text not null,
  triggered_at              timestamptz not null default now(),
  trigger                   text not null,
  input_brief               text,
  steps                     jsonb not null default '[]'::jsonb,
  evidence_validated_count  int  not null default 0,
  evaluation_surfaced_count int  not null default 0,
  total_cost_usd            numeric(12, 6) not null default 0,
  total_latency_ms          int  not null default 0,
  prompt_version            text,
  created_at                timestamptz not null default now()
);
create index if not exists sourcing_runs_triggered_at_idx
  on quadrant.sourcing_runs (triggered_at desc);

create table if not exists quadrant.sourcing_candidates (
  id                          text primary key,
  run_id                      text not null
                              references quadrant.sourcing_runs(id) on delete cascade,
  company_name                text not null,
  npi                         text,
  taxonomy_code               text,
  taxonomy_label              text,
  service_category            text,
  geography_state             text,
  geography_metro             text,
  medicare_revenue            numeric,
  medicare_pct_assumption     numeric,
  extrapolated_total_revenue  numeric,
  revenue_confidence_band     jsonb,
  is_third_party              boolean,
  revenue_over_5m             boolean,
  overall_confidence          numeric,
  evidence                    jsonb not null default '[]'::jsonb,
  thesis_fit                  jsonb,
  disqualifiers               jsonb,
  fit_state                   text not null default 'unreviewed',
  reviewed_by                 text,
  reviewed_at                 timestamptz,
  notes                       text,
  created_at                  timestamptz not null default now()
);
create index if not exists sourcing_candidates_run_id_idx
  on quadrant.sourcing_candidates (run_id);

-- 4. Hard isolation — revoke public, grant ONLY to quadrant_app.
revoke all on schema quadrant from public;
revoke all on all tables in schema quadrant from public;

grant usage on schema quadrant to quadrant_app;
grant select, insert, update, delete
  on all tables in schema quadrant to quadrant_app;

-- Future tables in this schema inherit the same grants.
alter default privileges in schema quadrant
  grant select, insert, update, delete on tables to quadrant_app;
