---
title: Governance over AG-UI
description: How the stack's governance protocols bind to AG-UI, the agent-to-human transport — the human-in-the-loop edge alongside the A2A and MCP bindings.
---

The protocols in this stack are transport-agnostic governance extensions. They
already bind to **A2A** (agent&#8596;agent, via `capabilities.extensions[]`) and
**MCP** (agent&#8596;tools, via `_meta`). [AG-UI](https://github.com/ag-ui-protocol/ag-ui)
is a third transport on a *different axis*: agent&#8596;human. It is where a
person plugs into a run — and several of these protocols have a moment that
belongs to the principal (approve this, I can't perceive that, this outcome was
bad). This page specifies how that same governance object travels over AG-UI.

AG-UI is **orthogonal** to the stack, not another protocol in it. A plain AG-UI
app needs no governance, and the governance protocols run perfectly well with no
human edge. The binding is a one-way bridge: when a protocol reaches a decision
that requires a person, it *projects* onto AG-UI's interrupt mechanism to get
the human in the loop, then resumes.

## A governed run, end to end

The visualization below is one human-facing task with all governance carried
over a single AG-UI run. Events on the agent&#8596;agent axis are blue; the
agent&#8596;human (AG-UI) events are amber; the **gates** are the points where
the run pauses for a person. Click any gate for its wire JSON, or step through.

<iframe
  src="/agent-protocol-stack/ag-ui-visualizer.html"
  title="Interactive visualization of one governed AG-UI run"
  loading="lazy"
  style="width:100%; height:880px; border:1px solid var(--sl-color-gray-5); border-radius:10px; background:transparent;"
></iframe>

## How the binding works

A governance object has one canonical wire type and one canonical URI. This
binding only says how that same object travels over AG-UI, exactly as the A2A
and MCP bindings say how it travels there. Four mechanisms carry it:

- **Identity by URI.** Every governance payload, `Custom` event, and interrupt
  is keyed by the protocol's canonical extension URI, carried in
  `metadata.governance.uri`. A governance-aware client routes on it; a generic
  AG-UI client ignores it and still works.
- **Interrupts for human-in-the-loop.** A decision that belongs to the principal
  is a `RUN_FINISHED` **interrupt** — `confirmation` for a yes/no (consent),
  `input_required` for structured input (a capacity-check response, a
  satisfaction rating). The run resumes on the same `threadId`.
- **State and Activity for posture.** Resume-required context (an accessibility
  envelope, a policy document) is published as a `STATE_SNAPSHOT` *before* the
  interrupt; surfaced-but-not-gating records (an attestation) ride as `Activity`
  or `Custom` events.
- **MetaEvent for volunteered feedback.** Feedback the human offers unprompted
  (a thumbs-up, a rating) maps to the relevant record without a blocking gate.

## Invariants

A conforming AG-UI governance binding holds these:

- **B-1 — URI identity.** Payloads and interrupts are keyed by the canonical
  protocol URI; resolution rejects an interrupt that is not its own.
- **B-2 — Non-breaking.** Unknown governance events and interrupt reasons are
  ignored by a generic client; the run still completes.
- **B-3 — Typed resume, denials in payload.** A resolved interrupt's payload
  validates against its `responseSchema` and deserializes to the protocol's wire
  type. A *denial* is encoded in that type (`decision: "rejected"`,
  `refused: true`) — never as a bare AG-UI `cancelled`, which means *abandoned*.
- **B-4 — No fabricated input.** A human decision must originate from a real
  `resume` or `MetaEvent`; the binding never invents one.
- **B-5 — State before interrupt.** Any state a resume depends on is emitted
  before the interrupt that needs it.
- **B-6 — Idempotent resume.** Each governance side effect is applied at most
  once per `interruptId`.

## Per-protocol fit

The fit is graded, and it falls out along the human-decision axis. Where a
principal has a real decision, the binding is strong; where governance is purely
between agents, AG-UI is at most an observability surface.

| Protocol | Fit | What rides AG-UI |
| --- | --- | --- |
| **Anumati / ACAP** (consent) | Strong | Policy in `STATE_SNAPSHOT`; consent decision as a `confirmation`/`tool_call` interrupt → `ConsentRecord`; per-action `AdherenceEvent`s as `Custom`; an ambiguous claim escalates to an interrupt. |
| **Sauvidya / PACE** (accessibility) | Strong | Capability envelope as `STATE_SNAPSHOT`; an active consent-capacity challenge as an `input_required` interrupt → `ActiveChallenge`. |
| **Phala** (welfare) | Strong | `PrincipalSatisfactionModel` as state; satisfaction as an `input_required` interrupt or a volunteered `MetaEvent` → `SatisfactionRecord`. |
| **Pramana** (verification) | Moderate | Each output's `ClaimAttestation` as an inspectable `Activity` event. Surface, don't gate. |
| **Abhyasa** (delivery) | Moderate | AG-UI is one more custody binding; a principal-visible escalation renders as a `confirmation` interrupt acknowledged by a `CustodyAck`. |
| **Pratyahara / NERVE**, **Yathartha** (integrity) | Observability only | Behavioral integrity is agent-to-agent; the human is not in the trust loop. Posture *may* surface to an operator dashboard via `StateSnapshot`. No governance gate — the omission is deliberate. |

That a uniform fit would be a *smell* is the point: forcing a human channel onto
machine-to-machine integrity checks would be a misfit. The unevenness is the
design working as intended.

## Conformance and reference bindings

An AG-UI governance binding conforms if it keys payloads and interrupts by the
canonical URI (B-1), ignores unknown governance events and reasons (B-2),
validates resolved-interrupt payloads and deserializes them to the protocol wire
type with denials encoded there (B-3), never fabricates human input (B-4), emits
resume-required state before the interrupt (B-5), and applies each governance
side effect at most once per `interruptId` (B-6).

Reference bindings exist for the three strong-fit protocols and the testbed:

- **PACE** — `pace.ag_ui` in
  [github.com/ravikiran438/sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace)
- **ACAP** — `acap.ag_ui` in
  [github.com/ravikiran438/agent-consent-protocol](https://github.com/ravikiran438/agent-consent-protocol)
- **Phala** — `phala.ag_ui` in
  [github.com/ravikiran438/phala-protocol](https://github.com/ravikiran438/phala-protocol)
- **ACS verdict projection** — `a2a_testbed.ag_ui` in
  [github.com/ravikiran438/a2a-testbed](https://github.com/ravikiran438/a2a-testbed),
  which renders an `escalate` control-plane verdict as a `confirmation`
  interrupt and resolves it fail-closed.
