# Adapter Merge Guide — Applying an InstructionPatch to Vendor Prompts

This guide pins down **exactly** where each field of the `InstructionPatch`
lands in each vendor's outbound request. Every adapter in
`fuzebox-aeos/packages/adapter_gateway/` implements this contract. When
adding a new vendor, follow the same seven-step recipe at the end.

All examples assume `contract_version = "dir.v1"`.

---

## Universal rules (apply to every vendor)

1. **Fail closed.** If the DIR call fails, times out, or returns a patch
   with a mismatched `contract_version`, the adapter MUST refuse to send
   the vendor request and emit a `governance.dir_unavailable` alert.
2. **Deterministic merge.** When multiple rules fire, merge in this
   order: `additional_instructions` = concat (rule-firing order, dedup
   by exact string); `restricted_tools` / `required_tools` = set-union;
   `required_citations` / `require_human_confirmation` = logical OR;
   `safety_envelope` = last non-null wins.
3. **Log the patch.** Every patch — including empty patches — is
   written to the Evidence Ledger with `decision_id`, `execution_id`,
   `rules_fired`, `pack_id`, and `safety_envelope`. The Evidence
   Bundle (Section 06) includes it verbatim.
4. **No silent rewriting.** The adapter does not paraphrase or shorten
   instructions. Each entry in `additional_instructions` is copied
   verbatim.
5. **Citation and confirmation side effects** apply to every vendor
   (see §8 and §9 below).

---

## 1. Anthropic Messages API (`messages.create`)

### Where fields go

| Patch field | Destination |
|---|---|
| `additional_instructions` | Prepended to the `system` string, each entry on its own line, separated by `\n\n` |
| `restricted_tools` | Filtered out of `tools[]` before the call |
| `required_tools` | Union-added to `tools[]` (adapter pulls definitions from the Skills Authority) |
| `required_citations` | Appends a citation-required directive to `system` and sets `metadata.require_citations = true` |
| `require_human_confirmation` | Routed through the hybrid path by the Adapter Gateway (see §9) |
| `safety_envelope`, `metadata.pack_id` | Attached to the outbound telemetry envelope only |

### Code sketch

```python
# packages/adapter_gateway/anthropic_adapter.py
from anthropic import Anthropic

def call(request, patch):
    if patch["contract_version"] != "dir.v1":
        raise DIRContractMismatch(patch["contract_version"])

    system_blocks = []
    for line in patch.get("additional_instructions", []):
        system_blocks.append(line)
    if patch.get("required_citations"):
        system_blocks.append(
            "Cite every factual claim using <cite source=\"...\" />. "
            "Omit the citation only for claims that are self-evident "
            "from the user's input."
        )
    system_blocks.append(request.base_system_prompt)
    system = "\n\n".join(system_blocks)

    restricted = set(patch.get("restricted_tools", []))
    required = set(patch.get("required_tools", []))
    tools = [t for t in request.tools if t["name"] not in restricted]
    for name in required:
        if name not in {t["name"] for t in tools}:
            tools.append(skills_authority.tool_def(name))

    return Anthropic().messages.create(
        model=request.model,
        system=system,
        tools=tools,
        messages=request.messages,
        metadata={
            "decision_id": patch["decision_id"],
            "execution_id": patch["execution_id"],
            "safety_envelope": patch.get("safety_envelope"),
            "rules_fired": patch.get("rules_fired", []),
        },
    )
```

---

## 2. OpenAI Responses API / AgentKit (`responses.create`)

### Where fields go

| Patch field | Destination |
|---|---|
| `additional_instructions` | Prepended to the `instructions` string, `\n\n` separated |
| `restricted_tools` | Filtered from `tools[]` before the call |
| `required_tools` | Union-added to `tools[]` |
| `required_citations` | Adds a structured-output schema that requires each answer to include a `citations: [{url, quote}]` array; adapter rejects responses that omit it |
| `require_human_confirmation` | Routed through hybrid path |

### Code sketch

```python
# packages/adapter_gateway/openai_adapter.py
from openai import OpenAI

def call(request, patch):
    if patch["contract_version"] != "dir.v1":
        raise DIRContractMismatch(patch["contract_version"])

    instructions_blocks = list(patch.get("additional_instructions", []))
    instructions_blocks.append(request.base_instructions)
    instructions = "\n\n".join(instructions_blocks)

    restricted = set(patch.get("restricted_tools", []))
    required = set(patch.get("required_tools", []))
    tools = [t for t in request.tools if t["function"]["name"] not in restricted]
    for name in required:
        if name not in {t["function"]["name"] for t in tools}:
            tools.append(skills_authority.tool_def_openai(name))

    response_format = request.response_format
    if patch.get("required_citations"):
        response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": "answer_with_citations",
                "schema": CITATIONS_REQUIRED_SCHEMA,
                "strict": True,
            },
        }

    return OpenAI().responses.create(
        model=request.model,
        instructions=instructions,
        tools=tools,
        input=request.input,
        response_format=response_format,
        metadata={
            "decision_id": patch["decision_id"],
            "execution_id": patch["execution_id"],
            "rules_fired": ",".join(patch.get("rules_fired", [])),
        },
    )
```

---

## 3. Salesforce Agentforce

Agentforce exposes prompts via **Topic prompt templates** and tools via
**Agent Actions**. The patch is applied at topic-template render time.

| Patch field | Destination |
|---|---|
| `additional_instructions` | Injected into the merge-field `{!DIR_ADDITIONAL_INSTRUCTIONS}` at the top of the Topic's Prompt Instructions section |
| `restricted_tools` | Filtered from the Agent's Action allowlist for this turn (via the `AgentSessionPolicy` Apex hook) |
| `required_tools` | Unioned into the Action allowlist |
| `required_citations` | Adds the `Respond with Citations` Prompt Template Footer |
| `require_human_confirmation` | Sets `AgentSession.HumanApprovalRequired__c = true`, which halts the flow at the next action node |

### Integration points

- Prompt template: `AEOS_DIR_Wrapped_Topic` — must contain the merge
  field `{!DIR_ADDITIONAL_INSTRUCTIONS}` on its own line just above the
  task instructions.
- Apex hook: `packages/adapter_gateway/agentforce/AEOSDIRHook.cls`
  implements `PolicyEnforcement.apply(patch)` and is registered as an
  `AgentSessionPolicyProvider`.
- Outbound telemetry: emit `AgentForceSession__e` platform event with
  `decision_id`, `execution_id`, `rules_fired`, `safety_envelope`.

---

## 4. Uniphore BAC (Business Agent Controller)

Uniphore BAC operates on a conversational system prompt plus a tool
manifest.

| Patch field | Destination |
|---|---|
| `additional_instructions` | Prepended to the BAC `system_prompt` field |
| `restricted_tools` | Removed from the BAC `tools` manifest |
| `required_tools` | Added to the BAC `tools` manifest |
| `required_citations` | Enables BAC's built-in `citation_strict` mode |
| `require_human_confirmation` | Forces BAC's `supervisor_handoff=on_completion` flag |

### Code sketch

```python
# packages/adapter_gateway/uniphore_adapter.py
def call(request, patch):
    if patch["contract_version"] != "dir.v1":
        raise DIRContractMismatch(patch["contract_version"])

    body = {
        "session_id": request.session_id,
        "system_prompt": "\n\n".join(
            patch.get("additional_instructions", []) + [request.base_system_prompt]
        ),
        "tools": _filter_tools(request.tools, patch),
        "flags": {
            "citation_strict": patch.get("required_citations", False),
            "supervisor_handoff": (
                "on_completion" if patch.get("require_human_confirmation") else "off"
            ),
            "safety_envelope": patch.get("safety_envelope"),
        },
        "aeos_metadata": {
            "decision_id": patch["decision_id"],
            "execution_id": patch["execution_id"],
            "rules_fired": patch.get("rules_fired", []),
        },
    }
    return bac_client.invoke(body)
```

---

## 5. Cloudflare Workers AI

Workers AI accepts a `messages[]` array and, for agent runs, a `tools[]`
manifest.

| Patch field | Destination |
|---|---|
| `additional_instructions` | Prepended to the first `system` message in `messages[]`. If no system message exists, one is inserted at index 0 |
| `restricted_tools` | Removed from the `tools` manifest |
| `required_tools` | Added to the `tools` manifest |
| `required_citations` | Adds a structured-output guard via `response_format` (Workers AI supports JSON-mode on supported models) |
| `require_human_confirmation` | Not directly supported — adapter returns the completion to the Adapter Gateway rather than the caller, which then routes via hybrid |

---

## 6. Human actor adapter

For pure-human paths, the patch becomes a briefing card that the actor
must acknowledge before starting.

| Patch field | Destination |
|---|---|
| `additional_instructions` | Rendered as a bulleted "Constraints" section on the work card |
| `restricted_tools` | Rendered as a "Do not" checklist; each must be acked |
| `required_tools` | Rendered as a "Must use" checklist; each must be acked |
| `required_citations` | Work card template switches to the citation-required variant |
| `require_human_confirmation` | No-op (already human) |
| `safety_envelope` | Displayed as a coloured banner; determines the sign-off workflow |

---

## 7. Cross-cutting: citation enforcement (`required_citations = true`)

Wherever the patch says citations are required, the adapter MUST:

1. Inject a citation-required directive into the vendor prompt (vendor-specific, see above).
2. Parse the model output for citations after the call completes.
3. If zero citations are present in a non-trivial answer, either:
   (a) re-prompt once with a clarifying "citation missing" instruction, or
   (b) fail the turn with `governance.citation_missing`.
4. Record every cited URL / ID in the Evidence Ledger alongside the decision.

---

## 8. Cross-cutting: human confirmation (`require_human_confirmation = true`)

The Adapter Gateway detours the execution to a **hybrid path** even if
the caller requested `pure_agent`:

1. The vendor produces a draft output.
2. The draft is NOT returned to the caller yet.
3. A confirmation task is staged to the actor selected by the UEF's
   hybrid path calculation.
4. Only after the human acks (or edits) the draft is the final output
   released to the caller.

The caller sees this as a slightly longer latency plus an
`x-aeos-path: hybrid` response header. The Ledger records both the
draft and the final (post-human) output.

---

## 9. Versioning and the seven-step recipe for new vendors

When adding adapter #N:

1. Parse the patch and reject on `contract_version != "dir.v1"`.
2. Build a vendor-appropriate system/instruction block with
   `additional_instructions` prepended to the base prompt.
3. Apply `restricted_tools` / `required_tools` as set operations on
   the vendor's tool manifest.
4. Wire `required_citations` to a vendor-native structured-output or
   citation mode.
5. For `require_human_confirmation`, hand the request back to the
   Adapter Gateway so it can detour through the hybrid path — do not
   try to implement human handoff inside the adapter.
6. Echo `decision_id`, `execution_id`, `rules_fired`, and
   `safety_envelope` into whatever metadata channel the vendor
   supports.
7. Register the adapter with `AdapterGateway.register("<vendor>", …)`
   and add an entry in the conformance suite.
