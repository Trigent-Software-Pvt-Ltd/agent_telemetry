# 90-Second Dashboard Narrative

The demo tells one story: **one task → one decision → one ledger row →
one signed attestation.** Everything on the dashboard should support
that narrative. Suggested sequence:

## 0:00 — Dashboard opens

- Hero row shows EAI / HPI / HLR for the demo tenant (e.g., Ken Garff).
- Path mix donut shows a balanced mix — mostly hybrid.

## 0:15 — Inject a task

- A new row appears in the live decision feed (panel 4).
- Narrator: "This is a brake-diagnosis task arriving from the service bay."

## 0:25 — Click into the decision

- Modal opens (panel 8).
- Eight-dimension scoring table visible for all candidate paths.
- Winning path is `hybrid_anthropic_human`.
- Narrator: "Notice three of the eight dimensions — GSTI, UOP, and
  Coordination Tax — come exclusively from rPotential. This is the
  joint-IP moat."

## 0:40 — Show the L9 patch

- In the same modal, expand "Applied DIR patch" section.
- Shows `rules_fired: ["dir_safety_relevant_confirmation", "dir_auto_safety_tool_lockdown"]`.
- Narrator: "Before any vendor saw the prompt, the Dynamic Instruction
  Runtime forced citations and locked down destructive tools."

## 0:55 — Show the policy outcome

- Required controls list: `audit_log`, `human_in_loop`, `evidence_export`,
  `explanation_interface`.
- Narrator: "Every one of those controls is now a line in the ledger.
  That's the EU AI Act Article-12 trail."

## 1:10 — Sign the bundle

- Click the "Download signed evidence bundle" button.
- A modal shows two signatures side-by-side: FuzeBox green, rPotential blue.
- Narrator: "Both parties attested. Single-vendor signatures are
  structurally refused — not a policy, a code invariant."

## 1:25 — Zoom out

- Rolling EAI time-series (panel 10) fills the screen.
- Narrator: "Scaled across the enterprise, this is what the board sees.
  Every point on this chart is signed by two parties."

## 1:30 — End

The whole demo takes 90 seconds. Every panel supports exactly one
beat of the narrative. Panels that don't fit should be hidden during
the live demo — available on a secondary tab for Q&A.
