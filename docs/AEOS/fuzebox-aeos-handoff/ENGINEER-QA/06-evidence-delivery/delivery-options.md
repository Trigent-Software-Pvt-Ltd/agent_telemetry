# Evidence Bundle Delivery — Three Viable Options

Each option has a different primary customer and a different operational cost.

---

## Option A — Direct UI download link

**What it is:** the React dashboard has a button; click it, backend calls
`AttestationSigner.sign_bundle(...)`, streams the JSON as a downloadable
file.

**Pros:**
- Demo-friendly. A visible, tangible "I just generated a signed bundle"
  moment on screen.
- Zero cloud-provider coupling.
- Customer takes the file; we're not on the hook for storing it.

**Cons:**
- Not good for automated regulator submission.
- Browser sessions time out — not great for large multi-period bundles.
- No built-in WORM guarantee; customer could tamper with the file they
  just received and accuse us.

**Effort:** ~1 day. Add endpoint `POST /v1/evidence/sign-and-download`;
React adds a button + file-save handler.

**Recommended default for the demo.**

---

## Option B — Customer-owned cloud bucket

**What it is:** at tenant onboarding, the customer provides a bucket
they own (S3 / GCS / Azure Blob) with appropriate IAM. AEOS writes
signed bundles to `s3://customer-bucket/aeos/evidence/{tenant}/{period}.json`
with S3 Object Lock set to comply mode for N years.

**Pros:**
- WORM storage — tamper-evident in the customer's own account.
- Regulators accept customer-held evidence as a defense posture.
- Scales cleanly; periodic exports can be cron'd.
- Customer owns the retention cost (which regulators also prefer).

**Cons:**
- Per-customer IAM setup; more onboarding friction.
- Need to handle three cloud providers eventually.
- Error modes are harder to demo ("the bucket's policy changed and now
  we can't write" isn't a great live demo).

**Effort:** ~1 week for S3 (Object Lock + cross-account role). +1 week
each for GCS and Azure.

**Recommended for production enterprise tenants.**

---

## Option C — Regulator-submission API

**What it is:** the bundle is posted directly to a regulator endpoint
(e.g., an EU AI Act national authority portal). Each regulator has a
different spec; we wrap them behind `packages/governance/submitters/`.

**Pros:**
- End-to-end narrative: "the decision, its ledger row, and its signed
  submission to the regulator — all in one automated flow."
- Highest-leverage commercial story; boards love it.

**Cons:**
- Regulator APIs don't exist yet in most jurisdictions. We'd be
  shipping stubs for a future state.
- Authentication models vary (OAuth, client-cert, DocuSign envelope).
- We inherit ops responsibility for every regulator we integrate.

**Effort:** unknown — depends on regulator. At least 2 weeks per
jurisdiction. Shouldn't be in the demo.

**Defer until a specific regulator partnership is inked.**

---

## Decision matrix

| Dimension | A: UI download | B: Customer bucket | C: Regulator API |
|---|---|---|---|
| Demo-ready | ✅ today | ⚠ 1 week | ❌ no regulator spec |
| Production-credible | ⚠ OK | ✅ best | ✅ best long-term |
| Customer onboarding cost | zero | medium | high |
| AEOS ops cost | zero | low | high |
| WORM guarantee | no | yes | yes |

---

## Recommendation

**Ship all three eventually; default the demo to Option A.**

Option A is the only one that lets us demo the full "one task → signed
bundle in your hands" narrative today without waiting on customer IAM
or regulator integrations. Implementing A doesn't foreclose B or C —
the bundle shape and the signer are identical. The delivery layer is
additive.

Once a real customer asks where their archive lives, implement B for
that customer. Once a regulator partnership is signed, implement C for
that jurisdiction.
