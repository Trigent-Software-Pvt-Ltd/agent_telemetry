# Quadrant Sourcing Agent — Live Runbook

How to move the Quadrant Sourcing Agent from mock mode to a genuinely live demo against AWS Bedrock and the isolated `quadrant` schema on `arkosdb.trigent.com`. Covers commits `ee1682b` (initial slice), `58b8f36` (Bedrock + Supabase swap), and `0f37311` (isolation to dedicated schema/role).

## 0. TL;DR

1. Apply `supabase/migrations/20260418_quadrant_schema.sql` in Studio SQL editor.
2. Open a network path from your machine to `arkosdb.trigent.com:5432`.
3. Set `DATA_SOURCE=live-sourcing` in `.env.local` and restart `npm run dev`.
4. Run `npm run smoke-live -- --full` and expect all green.
5. Open `/agents/sourcing-agent`, click **Run now**, verify real candidates render.

---

## 1. Before you start

Prerequisites:

1. Node 20+ and npm installed.
2. Repo cloned, branch `quadrant-mock` checked out, `npm install` completed.
3. `.env.local` already populated at the repo root. Confirm these keys exist (do not log values):
   - `DATA_SOURCE`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `BEDROCK_MODEL_ID`
   - `QUADRANT_DB_URL`
   - `MAX_RUN_COST_USD` (optional)
4. Access to `https://arkosdb.trigent.com` Studio with superuser credentials — see `arkosdb_credentials.md` (gitignored) for login details and the SSH key path.
5. AWS credentials valid in `us-east-1` with Bedrock invoke permission on the Claude Haiku 4.5 inference profile referenced by `BEDROCK_MODEL_ID`.

---

## 2. Apply the SQL migration

1. Open `supabase/migrations/20260418_quadrant_schema.sql`.
2. Replace the placeholder `<CHANGEME_QUADRANT_APP_PASSWORD>` with the SAME password that follows `quadrant_app:` in the `QUADRANT_DB_URL` value in `.env.local`. The two must match exactly.
3. Pick one apply path:

**Option 1 — Studio SQL editor (preferred, public HTTPS)**

1. Log in to `https://arkosdb.trigent.com` with superuser credentials.
2. Open SQL editor, paste the full contents of the migration file.
3. Click **Run**. Confirm success notice.

**Option 2 — psql via SSH tunnel**

```bash
ssh -i ~/.ssh/supabase-arkos-useast1.pem -L 5432:localhost:5433 ubuntu@35.171.245.76
```

In a second terminal:

```bash
psql "postgres://postgres:<supw>@localhost:5432/postgres" \
  -f supabase/migrations/20260418_quadrant_schema.sql
```

4. Verify in Studio SQL editor:

```sql
select schema_name
from information_schema.schemata
where schema_name = 'quadrant';

select tablename
from pg_tables
where schemaname = 'quadrant';
```

Expect one row for the schema and two rows for the tables (`sourcing_runs`, `sourcing_candidates`).

5. Rollback (only if you need to re-apply cleanly):

```sql
drop schema quadrant cascade;
drop role quadrant_app;
```

---

## 3. Open a network path from app to `arkosdb:5432`

Port 5432 is locked to VPC `10.2.0.0/16`. Pick one:

### Option A — Open SG rule for your current IP (preferred for office dev)

1. Get your public IP:
   ```bash
   curl ifconfig.me
   ```
2. In AWS Console (or CLI), open security group `sg-0a612fbb45f5364de`. Add inbound rule: TCP `5432` from `<your-ip>/32`.
3. Document the addition (date, IP, owner) in `arkosdb_credentials.md` so it can be revoked later.
4. Note: 5432 is the Supavisor pooler (session mode). Port 5433 (direct Postgres) or 6543 (transaction pooler) can be opened the same way if a specific workload needs them.

### Option B — SSH tunnel (preferred for laptop dev)

```bash
ssh -i ~/.ssh/supabase-arkos-useast1.pem -L 5432:localhost:5432 ubuntu@35.171.245.76
```

While the tunnel is open, edit `.env.local` and change the host in `QUADRANT_DB_URL` from `arkosdb.trigent.com` to `localhost`.

Caveat: the tunnel must be running any time the Next.js app or smoke test is running. Close the tunnel and revert the host when done.

### Option C — Deploy the app inside the VPC (preferred for production)

The existing app server at `10.2.4.197` is already inside the VPC. Deploy the Next.js app there. No SG rule, no tunnel, direct TCP to `arkosdb.trigent.com:5432` from private DNS.

---

## 4. Run the smoke test

```bash
npm run smoke-live
```

Quick checks: env presence, Bedrock reachability, DB reachability, schema existence, role privileges.

```bash
npm run smoke-live -- --full
```

Adds a mini end-to-end run: one Bedrock classification call (cost ≈ $0.01) plus one insert/select round-trip against `quadrant.sourcing_runs` and `quadrant.sourcing_candidates`.

Expect all green. Interpret common failures:

1. `AWS credentials invalid` — verify `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in `.env.local` against `credentials.csv` or `arkosdb_credentials.md`. Confirm `AWS_REGION=us-east-1`.
2. `ETIMEDOUT` on DB — the network path is not open. Re-check step 3. If using Option B, confirm the tunnel is still up.
3. `quadrant.sourcing_runs not found` — migration was not applied to this database. Re-run step 2.
4. `permission denied for schema quadrant` — the `quadrant_app` role lacks privileges. Re-run only the `GRANT` block from the migration.
5. `password authentication failed for user "quadrant_app"` — the password in `QUADRANT_DB_URL` does not match the one used when creating the role. Re-apply step 2 with matching passwords.

---

## 5. Flip to live mode

1. Edit `.env.local`:
   ```
   DATA_SOURCE=live-sourcing
   ```
2. Restart the dev server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000/agents/sourcing-agent`.

---

## 6. End-to-end verification

1. The agent header shows a green **LIVE** badge (mock mode shows a grey badge).
2. Click **Run now**. Expect a toast such as "Sourcing run started" and the page to refresh in 10–20 seconds with real candidates.
3. Click a candidate row. The evidence panel shows source URLs for NPI Registry and CMS.
4. Click **Good fit** on a candidate. Open `/sourcing/review` — the label is persisted and visible there.
5. In Studio SQL editor, confirm persistence:
   ```sql
   select count(*) from quadrant.sourcing_candidates;
   select count(*) from quadrant.sourcing_runs;
   ```
   The candidate count should match what the UI shows for the run.

---

## 7. Troubleshooting

1. **503 toast `live_not_provisioned`** — one or more envs are missing or a prerequisite failed at request time. Run `npm run smoke-live` and address the `missing: [...]` list returned by the API.
2. **500 toast** — check the dev server console. Common causes:
   - Typo in `BEDROCK_MODEL_ID`
   - `MAX_RUN_COST_USD` cap tripped mid-run
   - Postgres connection dropped mid-run (SSH tunnel closed, SG rule changed, laptop IP rotated)
3. **Empty candidate list** — NPI Registry returned zero matches for the default taxonomy+state combo. Relax filters in the request body, e.g.:
   ```json
   { "states": ["TX", "FL", "CA"], "limit": 30 }
   ```
4. **Claude returned malformed JSON** — the classifier has a tolerant parser. Worst case it classifies the candidate as "include for human review" with confidence `0.4`. No manual action needed.

---

## 8. Rollback / disable

1. Edit `.env.local`:
   ```
   DATA_SOURCE=mock
   ```
2. Restart `npm run dev`.
3. The UI reverts to seeded mock data immediately. Any live runs already persisted remain in `quadrant.sourcing_runs` and `quadrant.sourcing_candidates` for inspection but are not shown until `DATA_SOURCE=live-sourcing` is set again.

If you opened an SG rule in step 3 Option A, revoke it now and remove the line from `arkosdb_credentials.md`.
