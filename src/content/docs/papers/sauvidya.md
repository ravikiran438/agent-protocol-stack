---
title: "Sauvidya: An Accessibility Protocol for Agent-to-Principal Interaction in Autonomous Agent Networks"
description: "Full paper. The PACE specification: accessibility for agent-to-principal interaction."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Sauvidya: An Accessibility Protocol for Agent-to-Principal Interaction in Autonomous Agent Networks*. Zenodo, 2026. [doi:10.5281/zenodo.19633138](https://doi.org/10.5281/zenodo.19633138). Repository: [github.com/ravikiran438/sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

Sauvidya, Sanskrit for "with proper knowledge" or "with proper accessibility."
The specification defined herein is designated **PACE**:
**P**rincipal **A**ccessibility & **C**apacity **E**nvelope.

---

## Abstract

Agent protocols define how agents authenticate, consent, communicate, and report
outcomes. None define how agents adapt to the capabilities of the principal they
serve. The Agent2Agent (A2A) protocol, Model Context Protocol (MCP), Universal
Commerce Protocol (UCP), and Agentic Commerce Protocol (ACP) all assume a
principal who can see, hear, read, comprehend, decide in real time, and maintain
consistent cognitive capacity across interactions. For the estimated 1.3 billion
people worldwide living with some form of disability [29], and for every
adult over 65 whose sensory, motor, and cognitive capabilities are
declining, this assumption is structurally exclusionary.

We identify this as the *accessibility gap* in the agent protocol stack: the
absence of any protocol-level mechanism for an agent to discover, respect, and
adapt to the principal's interaction capabilities. We propose four primitives,
`PrincipalCapabilityProfile`, `InteractionModality`, `ConsentCapacityCheck`, and
`AdaptiveInteractionContract`, that together constitute the PACE (Principal
Accessibility & Capacity Envelope) specification for agent-to-principal
interaction. The protocol extends two existing
protocol layers: when deployed alongside Anumati (consent and adherence),
consent becomes accessibility-conditional; when deployed alongside Phala
(outcome and welfare feedback), satisfaction measurement becomes
capability-aware. We demonstrate the protocol in an
elder care agent interaction scenario, where accessibility is not optional
but existential.

---

## 1. Introduction

### 1.1 The Invisible Assumption

Consider a personal agent managing an elder's insurance renewal. The agent,
operating within an A2A task lifecycle, determines that the optimal action window
is opening. It surfaces a notification: "Your car insurance renews in 30 days.
I found 3 competing quotes. Tap to compare."

This interaction assumes the elder can:
- See the notification (vision)
- Read and comprehend the text (literacy, language, cognition)
- Evaluate three options and select one (decision capacity)
- Tap a small UI element (motor function)
- Remember this interaction when asked about it later (memory)
- Provide meaningful consent to the agent's subsequent actions (consent capacity)

For a 78-year-old with macular degeneration, mild cognitive decline, arthritis,
and primary fluency in Telugu rather than English, every one of these assumptions
fails. The agent completed its task successfully in protocol terms, notification
delivered, options presented, A2A task state transitioned to `working`. But the
principal received nothing. The protocol succeeded; the human was excluded.

This is not a UX problem solvable with larger fonts. It is a protocol-level
structural gap. Nor is it a capability gap in language technology: voice-first
Indian language models such as Sarvam AI's Sarvam-M [27], supporting all 22
scheduled Indian languages including Telugu, optimized for real-time voice
interaction, and developed under India's sovereign AI mission, demonstrate that
the infrastructure for multilingual, voice-primary agent interaction exists today.
What is missing is the protocol-level mechanism to *require* agents to use it
when the principal's capability profile demands it.

### 1.2 Why WCAG Is Insufficient

The Web Content Accessibility Guidelines (WCAG 2.2) address how web content
should be presented to users with disabilities. They govern the rendering layer:
color contrast, screen reader compatibility, keyboard navigation, text
alternatives for images.

Agent accessibility is a different problem. The agent decides:
- *What* to communicate (information selection)
- *When* to communicate (timing)
- *How much* to communicate (information density)
- *How many options* to present (decision load)
- *How long* to wait for a response (timeout)
- *Whether the principal can consent* at this moment (capacity)

WCAG says nothing about any of these. A perfectly WCAG-compliant interface can
still overwhelm an elder with five options when they can process two, interrupt
them during sundowning hours when their cognition is lowest, present information
in English when they think in Telugu, and accept a consent tap that the principal
did not cognitively process.

### 1.3 Scope of This Paper

We do not address agent-to-agent accessibility (agents communicating with other
agents). We address agent-to-principal accessibility: how an agent adapts its
interaction behavior to serve a principal whose capabilities differ from the
protocol's implicit assumptions.

The contributions of this paper are:

1. A formal account of the accessibility gap as a structural deficit in current
   agent protocols, distinct from rendering-layer accessibility (§2).
2. Four primitives, `PrincipalCapabilityProfile`, `InteractionModality`,
   `ConsentCapacityCheck`, and `AdaptiveInteractionContract`, that together
   constitute the PACE specification: a principal-capability-aware interaction
   model (§3).
3. Concrete extensions to Anumati [1] (consent becomes capability-conditional)
   and Phala [2] (satisfaction measurement becomes capability-aware) (§4).
4. A worked example demonstrating all four primitives in a concrete
   agent-to-principal interaction with an elder principal (§5).

---

## 2. The Accessibility Gap

### 2.1 What Current Protocols Assume

| Protocol | Implicit Capability Assumptions |
|----------|--------------------------------|
| A2A [3]  | Principal can evaluate task artifacts, provide feedback, approve actions |
| MCP [4]  | Principal can interpret tool results, decide on tool invocations |
| UCP [5]  | Principal can browse products, compare options, complete checkout |
| ACP [6]  | Principal can review purchase, confirm payment, understand terms |
| AP2 (Google) | Principal can review payment details, confirm amount, authorize transaction |
| Anumati [1] | Principal can read policy, comprehend terms, give informed consent |
| Phala [2] | Principal can perceive outcomes, form satisfaction judgments, provide ratings |

None of these protocols include any mechanism for the agent to discover that the
principal cannot do what the protocol assumes. AP2 is particularly notable: it
explicitly requires that "the user must always be in control" and anchors
transactions to "deterministic, non-repudiable proof of intent from the user"
[32]. But AP2 does not check whether the user can actually provide that
intent. A cryptographic signature on a Cart Mandate proves the principal's
device authorized the purchase; it does not prove the principal understood
what was being authorized. A payment confirmation screen
presented to an elder with low vision, in a language she does not read,
during sundowning hours, is not meaningful authorization.

### 2.2 Dimensions of Principal Capability

We identify eight capability dimensions relevant to agent-to-principal
interaction:

| Dimension | Range | Agent Impact |
|-----------|-------|-------------|
| Vision | full → none | Determines modality (visual vs auditory vs haptic) |
| Hearing | full → none | Determines voice interaction feasibility |
| Motor | full → assistive_device | Determines input method (tap, voice, switch) |
| Cognitive | full → severe_decline | Determines information density, option count, pacing |
| Language | [languages + fluency scores] | Determines interaction language, NOT assumed English |
| Literacy | full → none | Determines text vs voice vs pictorial communication |
| Tech fluency | high → none | Determines interface complexity |
| Decision capacity | stable → guardian_required | Determines consent model and autonomy level |

These are not disability labels. They are a *communication contract*: the agent
MUST adapt its interaction modality to match the principal's declared
capabilities. If the agent cannot meet the contract, it MUST NOT proceed and
MUST escalate.

### 2.3 The Consent Capacity Problem

Anumati [1] formalizes consent as a timestamped acknowledgement with clause-level
adherence. But consent requires cognitive capacity, and cognitive capacity
fluctuates:

- **Sundowning**: Alzheimer's and dementia patients experience significant
  cognitive decline in late afternoon and evening. A consent given at 3pm may
  be meaningfully informed; the same consent at 7pm may not be.
- **Medication effects**: Pain medication, sedatives, and other common elder
  prescriptions temporarily impair decision-making capacity.
- **Fatigue**: Cognitive fatigue accumulates through the day. An elder who
  processed three agent interactions in the morning may lack capacity for a
  fourth in the afternoon.
- **Good days and bad days**: Cognitive decline is not linear. Capacity
  varies day to day in ways that are partially predictable from behavioral
  signals.

No agent protocol checks whether the principal is capable of consenting *at
this moment*. Anumati records that consent was given; PACE verifies that
consent *could be* meaningfully given.

---

## 3. PACE: Four Primitives

![PACE architecture](/agent-protocol-stack/figures/sauvidya/pace_architecture.png)

**Figure 1.** PACE architecture: the guardian declares a
PrincipalCapabilityProfile on-device. Agents compute an
InteractionModality, perform a ConsentCapacityCheck before consent,
and operate under an AdaptiveInteractionContract. WelfareTrace feeds
declining trajectories back to the guardian.

### 3.1 PrincipalCapabilityProfile (PCP)

A `PrincipalCapabilityProfile` is a per-principal, on-device declaration of
interaction capabilities. It is declared by the principal or their guardian,
stored on-device, and referenced by every agent before initiating interaction.

Formally, a `PrincipalCapabilityProfile` *PCP* is a tuple:

```
PCP = (principal_id, version, declared_at, declared_by,
       capabilities, adaptations_required)
```

where `declared_by` ∈ {`principal`, `guardian:<guardian_id>`} records who made
the declaration, and `capabilities` is a structured record:

```
capabilities = {
  vision:            full | low | minimal | none,
  hearing:           full | partial | minimal | none,
  motor:             full | limited | minimal | assistive_device,
  cognitive:         full | mild_decline | moderate_decline | severe_decline,
  language:          [{code: "te", fluency: 1.0}, {code: "en", fluency: 0.4}],
  literacy:          full | functional | limited | none,
  tech_fluency:      high | moderate | low | none,
  decision_capacity: stable | fluctuating | limited | guardian_required
}
```

`adaptations_required` is a list of specific adaptations derived from
capabilities:

```
adaptations_required = [
  "voice_primary",           // vision = low|minimal|none
  "slow_speech_rate",        // hearing = partial
  "language:te",             // primary language Telugu
  "max_options:2",           // cognitive = moderate_decline
  "extended_timeout:300s",   // motor = limited
  "memory_recap:true",       // cognitive = mild_decline+
  "guardian_cc:always",      // decision_capacity = limited+
  "no_sundown_interaction"   // cognitive = moderate_decline+; window is principal-specific
]
```

**Invariant PCP-1.** The PCP is stored on-device. No remote agent may write or
modify a PCP. Agents receive a read-only copy relevant to their interaction.

**Invariant PCP-2.** PCP versions are immutable and append-only. A new
declaration creates a new version. This preserves the history of the
principal's capability trajectory, critical for detecting decline and
alerting guardians. If a guardian enters an incorrect value (e.g., Telugu
fluency 0.4 instead of 1.0), the correction is a new version with a
`correction_of` field referencing the erroneous version. Prior
`ConsentRecord`s remain valid under the version they referenced, they
are not retroactively invalidated. Errors are corrected forward, not
backward, preserving audit integrity.

**Invariant PCP-3.** When `declared_by` = `guardian:<id>`, the guardian's
identity MUST be verifiable. When Anumati [1] is deployed, the guardian
is identified as the `principal_id` on the relevant `ConsentRecord`. When
Anumati is not deployed, guardian identity is verified through the agent
network's authentication layer. No unverified party may declare
capabilities for a principal.

### 3.2 InteractionModality (IM)

Before initiating any interaction, an agent must decide how to communicate
with this specific principal. The `InteractionModality` is that decision,
computed from the principal's PCP.

Formally:

```
IM = (agent_id, principal_id, pcp_version, modality_plan,
      fallback_chain, escalation_target)
```

where `modality_plan` specifies the concrete interaction adaptations:

```
modality_plan = {
  primary_channel:     voice | text | visual | haptic,
  language:            "te",
  speech_rate:         0.7,    // 1.0 = normal
  information_density: low,    // low | medium | high
  max_options:         2,
  confirmation_style:  voice_repeat_back,
  memory_aid:          true,   // recap prior context each interaction
  timeout_seconds:     300
}
```

`fallback_chain` is an ordered list of degraded modalities if the primary fails:

```
fallback_chain = [
  { channel: "text_large_font", condition: "voice_unavailable" },
  { channel: "guardian_relay", condition: "all_direct_channels_failed" }
]
```

**Invariant IM-1.** An agent MUST compute an `InteractionModality` from the
principal's PCP before initiating any interaction. An agent that cannot
satisfy the PCP's `adaptations_required` MUST NOT initiate interaction and
MUST escalate to `escalation_target`.

**Invariant IM-2.** If PCP specifies `language:te` (Telugu) and the agent
cannot interact in Telugu, the agent MUST NOT default to English. It must
either find a language-capable sub-agent or escalate to the guardian.

### 3.3 ConsentCapacityCheck (CCC)

Consent requires cognitive capacity, and cognitive capacity fluctuates.
The `ConsentCapacityCheck` verifies that the principal is currently capable
of providing meaningful consent. It is performed before any interaction requiring
consent (as defined by Anumati).

Formally:

```
CCC = (principal_id, timestamp, capacity_signal, confidence,
       assessment_method, pcp_version, recommendation)
```

where `capacity_signal` ∈ [0.0, 1.0] estimates current cognitive capacity,
`assessment_method` ∈ {`passive`, `active`, `guardian_confirmed`}, and
`recommendation` ∈ {`proceed`, `simplify`, `defer`, `escalate_to_guardian`}.

**Passive assessment signals:**
- Time of day vs declared sundowning risk window
- Number of interactions already processed today (fatigue model)
- Response latency trend (slowing responses suggest declining capacity)
- Response coherence (if voice: speech clarity; if text: typing patterns)

**Active assessment:**
- Simple verification calibrated to principal's baseline: "Mrs. Lakshmi,
  we talked yesterday about your insurance. Do you remember what we decided?"
- Not a cognitive test, a contextual continuity check
- **Success criteria**: a coherent contextual response (correct or
  approximate recall of prior interaction) = proceed. Partial recall with
  hesitation or confusion = simplify. Incoherent response, unrelated answer,
  or no response = defer. The assessment evaluates engagement and
  orientation, not memory accuracy, a principal who says "we talked about
  the electricity bill, right?" when the topic was insurance is oriented
  and engaged, even if recall is imprecise.

**Capacity thresholds:**

The following thresholds are guardian-configurable defaults, not clinical
cutoffs. They are structurally analogous to the four-tier capacity model
in clinical assessment instruments such as the MacCAT-T [28], which
distinguishes between adequate, mildly impaired, moderately impaired, and
severely impaired decision-making capacity. The mapping from clinical tiers
to protocol actions is: adequate → proceed, mildly impaired → simplify,
moderately impaired → defer, severely impaired → escalate. Guardians
adjust thresholds based on their knowledge of the principal, a guardian
who observes that the principal functions well until 0.5 can lower the
`proceed` threshold accordingly.

```
capacity_signal >= 0.7  → proceed normally
capacity_signal >= 0.4  → simplify (reduce options, extend timeouts)
capacity_signal >= 0.2  → defer to next valid time window
capacity_signal <  0.2  → escalate to guardian immediately
```

These thresholds and the concrete values throughout this paper (speech
rate 0.7, timeout 300s, max_options 2, etc.) are reference defaults from
the companion implementation. They are guardian-configurable and
deployment-specific, not proven optimal. The companion repository's
simulation harness is where defaults are calibrated against specific
principal populations.

**Invariant CCC-1.** A `ConsentCapacityCheck` MUST be performed before any
interaction that creates a `ConsentRecord` (Anumati) for a principal whose
PCP declares `decision_capacity` ∈ {`fluctuating`, `limited`,
`guardian_required`}.

**Invariant CCC-2.** CCC results MUST NOT be transmitted to any remote agent
or service provider. They stay on-device. A provider agent learns only that
"the interaction was deferred", never why.

**Invariant CCC-3.** CCC is not a clinical assessment. It does not diagnose.
It measures whether *this interaction at this moment* should proceed, be
simplified, be deferred, or be escalated. Clinical assessment is outside
protocol scope.

### 3.4 AdaptiveInteractionContract (AIC)

The `AdaptiveInteractionContract` is the binding agreement governing how all
agents in the network interact with this principal. It is derived from the PCP,
approved by the guardian (if applicable), and enforced at the protocol level.

Formally:

```
AIC = (principal_id, pcp_version, guardian_approved_by,
       interaction_rules, violation_policy)
```

where `interaction_rules`:

```
interaction_rules = {
  response_timeout_seconds:  300,
  max_options_per_turn:      2,
  confirmation_style:        voice_repeat_back,
  language:                  "te",
  speech_rate:               0.7,
  information_density:       low,
  memory_aid:                true,
  guardian_cc:               always | threshold | never,
  valid_time_windows:        [{start: "09:00", end: "11:00"},
                              {start: "14:00", end: "16:00"}],
  sundown_block:             {start: "17:00", end: "08:00"},
  max_interactions_per_day:  3,
  escalation_on_confusion:   true,
  non_response_policy:       {max_retries: 1, retry_delay: "next_window",
                              escalate_after: 2}
}
```

`violation_policy` defines consequences for agents that breach the contract:

```
violation_policy = {
  on_time_window_violation:       block_agent + notify_guardian,
  on_option_overload:             reject_interaction + log,
  on_language_mismatch:           reject_interaction + escalate,
  on_capacity_check_skip:         block_agent + notify_guardian + audit_flag
}
```

**Invariant AIC-1.** An agent MUST NOT initiate interaction outside the
principal's declared `valid_time_windows` unless classified as emergency
(defined by guardian in the AIC).

**Invariant AIC-2.** An agent MUST NOT present more than `max_options_per_turn`
options in a single interaction turn. If more options exist, the agent MUST
pre-filter using welfare-aligned scoring (Phala) and present only the top N.

**Invariant AIC-3.** If the principal does not respond within
`response_timeout_seconds`, the agent MUST NOT retry immediately. It must wait
for the next valid time window. After `non_response_policy.escalate_after`
non-responses, escalate to guardian.

**Invariant AIC-4.** The AIC is enforceable: any agent in the network that
violates the contract is subject to `violation_policy`. The orchestrating
agent (e.g., the orchestrator in a service marketplace) maintains a
principal-specific block list
and enforces violations; guardians are notified of all enforcement actions.
In a multi-orchestrator network, block list entries are shared as signed
attestations through the agent network. The blocking orchestrator signs
a violation record and receiving orchestrators verify the signature
before enforcing. This prevents a single orchestrator from unilaterally
blocking an agent across the entire network without a verifiable
violation record.

---

## 4. Protocol Extensions

PACE's four primitives are self-contained. Any A2A or MCP deployment
that implements PCP, IM, CCC, and AIC gains a capability-aware
interaction path without requiring any additional protocol. The
subsections below describe how PACE declares itself on A2A and MCP
(§4.0), and how it optionally composes with consent protocols (§4.1),
welfare-feedback protocols (§4.2), and payment protocols (§4.3) when
those are also deployed. None of these compositions are required.

### 4.0 A2A and MCP Declaration

PACE extends the A2A AgentCard using the standard `capabilities.extensions`
mechanism so that no core spec change is required. A PACE-aware agent
declares support, advertises its supported modalities and languages,
and points peers at the runtime endpoints needed for the protocol's
control plane.

The body of the `capabilities.extensions[]` entry is an
**`AccessibilityServiceRef`**. Modeled after ACAP's
`UsagePolicyRef` and the corresponding Phala/NERVE service refs, this
object lets third-party validators check the declaration against a
typed schema rather than ad-hoc inspection.

| Field | Type | Required | Notes |
|---|---|---|---|
| `version` | string | yes | PACE protocol semver |
| `pcp_endpoint` | URL | yes | authenticated PCP exchange endpoint |
| `aic_endpoint` | URL pattern | yes | includes `{principal_id}` placeholder |
| `violation_notice_endpoint` | URL | yes | where peers POST `PACEViolationNotice` (§4.5) |
| `supports_active_assessment` | bool | no (default true) | does the agent implement active CCC? |
| `supported_modalities` | string[] (≥ 1) | yes | `PrimaryChannel` values |
| `supported_languages` | string[] (≥ 1) | yes | ISO 639-1 codes |
| `guardian_escalation_endpoint` | URL | conditional | required when serving `guardian_required` principals |

```json
{
  "name": "service-routing-agent",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://ravikiran438.github.io/sauvidya-pace/v1",
        "description": "Supports the PACE principal accessibility protocol.",
        "required": true,
        "params": {
          "version": "1.0.0",
          "pcp_endpoint": "https://orch.example.com/pace/pcp",
          "aic_endpoint": "https://orch.example.com/pace/aic/{principal_id}",
          "violation_notice_endpoint": "https://orch.example.com/pace/violations",
          "supported_modalities": ["voice", "large_text"],
          "supported_languages": ["en", "te"]
        }
      }
    ]
  }
}
```

The `required: true` default reflects that an agent serving a principal
with a registered PCP MUST compute an InteractionModality before
interacting. Agents that cannot satisfy the PCP's `adaptations_required`
MUST NOT initiate interaction. For MCP, the PACE metadata is carried
in `serverCapabilities` during the initialize handshake, keyed by the
same extension URI.

**Manifest discoverability.** A PACE-aware agent's
`AccessibilityServiceRef` block can be validated by any third party
against the protocol's published `ExtensionManifest` (a JSON Schema
for the `params` shape) at
<https://ravikiran438.github.io/sauvidya-pace/v1/manifest.json>.
This removes the per-protocol hard-coding earlier validators required.

### 4.1 Optional Composition: Consent Protocols

When a consent protocol such as Anumati [1] is deployed alongside PACE,
consent becomes accessibility-conditional. Anumati defines three primitives
(`PolicyDocument`, `ConsentRecord`, `AdherenceEvent`). PACE extends the
consent lifecycle as follows:

**Before ConsentRecord creation:**
1. Agent retrieves principal's PCP
2. Agent computes InteractionModality from PCP
3. If PCP.decision_capacity ∈ {fluctuating, limited, guardian_required}:
   perform ConsentCapacityCheck
4. If CCC.recommendation = proceed or simplify: present consent in adapted
   modality
5. If CCC.recommendation = defer or escalate: do not present consent

**`PACEConsentAnnotation` — sibling primitive.** PACE-side consent
metadata is carried as a sibling primitive, `PACEConsentAnnotation`,
that **references** the Anumati `ConsentRecord` by `consent_record_id`
rather than embedding inside it, leaving Anumati's schema unmodified. The
sibling-annotation pattern follows the principle that each protocol
owns its own primitives and references others by ID; it avoids
coupling Anumati's wire format to PACE's evolving fields, and it
preserves CCC-2 (capacity_signal MUST NOT be transmitted to remote
agents) by keeping the annotation on-device with the orchestrator.

```json
{
  "annotation_id": "ann-abc123",
  "consent_record_id": "cr-abc123",
  "principal_id": "...",
  "pcp_version": "v1",
  "aic_version": "v1",
  "ccc_performed": true,
  "ccc_capacity_signal": 0.78,
  "ccc_recommendation": "proceed",
  "ccc_assessment_method": "active",
  "active_challenge": { "challenge_id": "ch-1", "...": "...see §4.4" },
  "interaction_modality": { "primary_channel": "voice", "language": "te" },
  "annotated_at": "2026-04-01T10:05:00Z"
}
```

A `PACEConsentAnnotation` without a corresponding Anumati `ConsentRecord`
is meaningless; an Anumati `ConsentRecord` without a `PACEConsentAnnotation`
for a principal with a registered PCP is non-compliant under PACE. The
annotation is held on-device by the PACE orchestrator and surfaced to
local audit; remote agents have no expectation of receiving it.

**Migration note.** An implementation that embeds PACE consent
metadata as a `ConsentRecord.pace` block remains conformant with Anumati
but not with PACE. To migrate: extract the `pace.*` keys from the
ConsentRecord, package them as a `PACEConsentAnnotation` keyed by
`consent_record_id`, and stop writing the `pace` block into the
ConsentRecord.

### 4.4 Active Assessment Formalization

§3.3 specifies `assessment_method` as one of `passive | active |
guardian_confirmed`. The on-wire form of an active CCC is formalized as
`ActiveChallenge`:

| Field | Type | Notes |
|---|---|---|
| `challenge_id` | UUID | |
| `challenge_type` | enum | `comprehension_question` \| `confirmation_repeat` \| `context_continuity` \| `equivalence_check` |
| `challenge_hash` | `sha256:<hex>` | digest of the canonical NFC-normalized UTF-8 challenge text |
| `response_hash` | `sha256:<hex>` | digest of the canonical principal response |
| `response_window_ms` | int > 0 | maximum allowed response time |
| `response_received_ms` | int? | None iff classified `non_responsive` |
| `classified_as` | enum | `comprehended` \| `partial` \| `non_responsive` \| `refused` |
| `posed_at` | ISO 8601 | |

Both digests are over the canonical NFC-normalized UTF-8 form (with
trailing whitespace stripped). Auditors can re-hash an original
challenge transcript and confirm tamper-evidence without storing
principal speech, satisfying CCC-2's privacy requirement.

### 4.5 Cross-Orchestrator Violation Propagation

§3.4 specifies `violation_policy` for the AIC ("block_agent +
notify_guardian"). For a block to propagate from the detecting
orchestrator to peer orchestrators serving the same principal — rather
than degrading to a local-only mute, through which the principal could be
re-victimized via a different orchestrator — PACE defines
`PACEViolationNotice` and three handling rules.

```json
{
  "notice_id": "n-abc",
  "principal_id": "...",
  "aic_version": "v1",
  "offending_agent_id": "did:agent:rogue",
  "violation_type": "time_window",
  "detected_at": "2026-04-30T22:30:00Z",
  "detected_by": "did:orch:home",
  "enforcement_actions": ["block_agent", "notify_guardian"],
  "block_duration_seconds": 86400,
  "evidence_hash": "sha256:...",
  "issuer_signature": "..."
}
```

**Handling rules.**

- **V-1 (block enforcement):** A receiver bound by the same `aic_version`
  for the same `principal_id` MUST add `offending_agent_id` to its
  block list for at least `block_duration_seconds` from `detected_at`.
- **V-2 (one-hop):** Receivers MUST NOT forward the notice. The
  broadcast is one-hop; loop prevention does not depend on receiver
  discipline.
- **V-3 (scope):** Receivers without an AIC for `principal_id` MUST
  log the notice for audit but MUST NOT apply the block, since the
  principal is not under their care.

The `evidence_hash` digest uses
`PACEViolationNotice.compute_evidence_hash(principal_id, aic_version,
offending_agent_id, violation_type, detected_at, clause_id)` so audit
records keyed by the same digest are reproducible.

### 4.6 Capacity Trend (CCCTrend)

§5 lists `ccc_trend` as an output. Its canonical wire-format enum is
`CCCTrend ∈ {stable, improving, declining, insufficient_data}`. The
reference derivation is the OLS slope of `capacity_signal` over the
trailing 30-day window: `improving` if slope > +0.005,
`declining` if slope < -0.005, `stable` otherwise, `insufficient_data`
if fewer than 5 samples fall in the window. The reference algorithm is
non-normative — deployments are free to use a different statistic
(EWMA, Mann-Kendall, etc.) so long as their result maps onto the
canonical four-value enum.

### 4.2 Optional Composition: Welfare-Feedback Protocols

When a welfare-feedback protocol such as Phala [2] is deployed alongside
PACE, satisfaction measurement becomes capability-aware:

**SatisfactionRecord adaptation:**

When computing `valence` for a principal with PCP.cognitive = moderate_decline:
- Implicit signals are weighted higher (principal may not provide explicit
  ratings reliably)
- `explicit_rating_floor` from PSM is cross-referenced with PCP to set
  appropriate expectations
- Response time signals are normalized against PCP-declared `response_timeout`
  (300s timeout means a 200s response is fast, not slow)

**PACE accessibility trace (computed alongside WelfareTrace):**

When Phala is deployed, PACE computes its own accessibility metrics on-device,
correlated with but not stored inside Phala's `WelfareTrace` tuple:

```
pace_accessibility = {
  capability_trajectory:  stable | declining | improving,
  interaction_success_rate: 0.73,  // % of interactions principal engaged with
  modality_adaptation_count: 12,   // how often agent had to adapt
  guardian_escalation_rate: 0.15,  // rising = potential capacity decline
  ccc_trend: declining             // capacity check scores trending down
}
```

When `capability_trajectory = declining`, the system alerts the guardian that the
principal's capabilities may have changed and the PCP should be re-evaluated. The
agent does not diagnose, it observes that interactions are succeeding less often
and defers to the guardian. When Phala is not deployed, PACE computes these
metrics independently from its own interaction logs.

### 4.3 Optional Composition: Payment Protocols

Payment authorization is the highest-stakes agent-to-principal interaction.
Google's Agent Payments Protocol (AP2) [32] requires that "the user must
always be in control" and uses cryptographic mandates to prove payment
intent. But AP2 does not specify how the principal provides that intent
when their capabilities differ from the protocol's assumptions. PACE
fills this gap. At the AP2 payment boundary:

1. The agent retrieves the principal's PCP and computes an
   `InteractionModality` for the payment confirmation. For a principal
   with `vision: low` and `language: [te]`, this means voice
   confirmation in Telugu, not a payment-detail screen.
2. `ConsentCapacityCheck` verifies the principal can authorize right
   now. A payment request during sundowning hours is deferred to the
   next valid window, regardless of urgency.
3. The `AdaptiveInteractionContract` limits payment confirmations to
   one at a time (`max_options_per_turn: 1` for financial transactions),
   requires the guardian to be copied on every payment above a
   configurable threshold, and blocks retry after non-response.

This integration addresses regulatory requirements that AP2 alone cannot
satisfy: the CFPB's "meaningful consent" standard for consumer financial
transactions, elder financial protection guidelines (the FBI's 2024 Elder
Fraud Report [31] documents $3.4 billion in losses in 2023 alone, many involving elders
who "consented" to transactions they did not understand), and the EU
Consumer Rights Directive's requirement for clear, comprehensible
pre-contractual information adapted to the consumer's circumstances.

---

## 5. Worked Example: Agent-to-Principal Interaction

![PACE temporal sequence](/agent-protocol-stack/figures/sauvidya/pace_sequence.png)

**Figure 2.** Temporal sequence of a PACE-governed interaction: guardian
declares PCP, agent computes modality and performs capacity check, then
interacts with the principal in the adapted modality. PACE's accessibility
trace monitors long-term metrics (optionally correlated with Phala's
WelfareTrace when that protocol is present).

We demonstrate all four PACE primitives through a concrete agent-to-
principal interaction scenario. The scenario is representative of any
agent network serving a principal with accessibility needs, whether the
agent is managing services, paying bills, scheduling appointments, or
communicating with third parties on the principal's behalf. The primitives
apply to any A2A or MCP deployment. The Telugu-speaking elder
scenario below is one instantiation; the PCP dimensions are
population-general and apply equally to an autistic adult who is
independent and Deaf, a principal with temporary post-surgical
limitations, or any individual whose capabilities differ from the
protocol's implicit assumptions.

### 5.1 Declaring a PrincipalCapabilityProfile

When a guardian registers an elder principal with an agent network, the
first step is declaring a `PrincipalCapabilityProfile`. Consider an 81-year-old
principal in Hyderabad whose adult child serves as guardian from the United
States:

```json
{
  "principal_id": "p-lakshmi-82",
  "version": "v1",
  "declared_at": "2026-03-01T10:00:00+05:30",
  "declared_by": "guardian:g-ravi-us",
  "capabilities": {
    "vision": "low",
    "hearing": "partial",
    "motor": "limited",
    "cognitive": "mild_decline",
    "language": [
      {"code": "te", "fluency": 1.0},
      {"code": "en", "fluency": 0.3}
    ],
    "literacy": "functional",
    "tech_fluency": "low",
    "decision_capacity": "fluctuating"
  },
  "adaptations_required": [
    "voice_primary",
    "slow_speech_rate",
    "language:te",
    "max_options:2",
    "extended_timeout:300s",
    "memory_recap:true",
    "guardian_cc:always",
    "no_sundown_interaction"
  ]
}
```

This PCP governs every subsequent agent interaction with this principal. No
agent in the network, routing agent, service agent, notification agent,
may interact with this principal in English, present more than two options,
or initiate contact after 5pm.

### 5.2 Computing an InteractionModality

When an agent needs to present the principal with a decision, in this
case, choosing between two home aide services, it computes the
`InteractionModality` from the PCP before initiating contact:

```json
{
  "agent_id": "service-routing-agent",
  "principal_id": "p-lakshmi-82",
  "pcp_version": "v1",
  "modality_plan": {
    "primary_channel": "voice",
    "language": "te",
    "speech_rate": 0.7,
    "information_density": "low",
    "max_options": 2,
    "confirmation_style": "voice_repeat_back",
    "memory_aid": true,
    "timeout_seconds": 300
  },
  "fallback_chain": [
    {"channel": "guardian_relay", "condition": "voice_unavailable"}
  ],
  "escalation_target": "guardian:g-ravi-us"
}
```

The agent calls the principal in Telugu, speaks slowly, presents at most two
service provider options ("Amma, I found two home aide services near you. The
first one is Lakshmi Home Care, available Monday and Thursday. The second is
Sai Services, available every day. Which would you prefer, or shall I tell
Ravi to decide?"), waits up to five minutes for a response, and recaps prior
context if this is a follow-up interaction.

If the provider agent cannot interact in Telugu, Invariant IM-2 blocks the
interaction entirely. The principal is never forced to engage in a language
she does not think in. In practice, the agent delegates Telugu voice
interaction to a language-capable sub-agent powered by
a voice-first Indian language model such as Sarvam AI's Sarvam-M [27], which
supports Telugu with real-time voice inference at low latency. The protocol
does not mandate a specific model, it mandates that *some* capable model must
be available before the interaction may proceed.

### 5.3 Performing a ConsentCapacityCheck

Before executing a delegated action, in this case, scheduling a new home
aide service, a decision requiring Anumati
consent, the system performs a `ConsentCapacityCheck`:

**Passive signals assessed:**
- Current time: 10:15 AM IST → within valid window (9am-11am) ✓
- Interactions today: 1 (below `max_interactions_per_day: 3`) ✓
- Last interaction response latency: 45 seconds (within baseline) ✓

**CCC result:**
```json
{
  "capacity_signal": 0.82,
  "confidence": 0.75,
  "assessment_method": "passive",
  "recommendation": "proceed"
}
```

The interaction proceeds. Had the time been 6:30 PM, within the sundown
block, the system would have deferred to the next morning window regardless
of any other signal.

### 5.4 Enforcing an AdaptiveInteractionContract

The AIC for this principal governs all agents in the network:

```json
{
  "interaction_rules": {
    "response_timeout_seconds": 300,
    "max_options_per_turn": 2,
    "confirmation_style": "voice_repeat_back",
    "language": "te",
    "speech_rate": 0.7,
    "information_density": "low",
    "memory_aid": true,
    "guardian_cc": "always",
    "valid_time_windows": [
      {"start": "09:00", "end": "11:00"},
      {"start": "14:00", "end": "16:00"}
    ],
    "sundown_block": {"start": "17:00", "end": "08:00"},
    "max_interactions_per_day": 3,
    "escalation_on_confusion": true,
    "non_response_policy": {
      "max_retries": 1,
      "retry_delay": "next_window",
      "escalate_after": 2
    }
  },
  "violation_policy": {
    "on_time_window_violation": "block_agent + notify_guardian",
    "on_option_overload": "reject_interaction + log",
    "on_language_mismatch": "reject_interaction + escalate",
    "on_capacity_check_skip": "block_agent + notify_guardian + audit_flag"
  }
}
```

An agent that contacts the principal at 7pm is blocked and the guardian is
notified. An agent that presents four options in one turn has the interaction
rejected. These are not suggestions, they are protocol enforcement actions.

### 5.5 PACE Accessibility Metrics

After six weeks of agent interactions, PACE computes accessibility
metrics on-device (alongside Phala's WelfareTrace if deployed):

```json
{
  "accessibility": {
    "capability_trajectory": "stable",
    "interaction_success_rate": 0.78,
    "modality_adaptation_count": 8,
    "guardian_escalation_rate": 0.22,
    "ccc_trend": "stable"
  }
}
```

The principal is engaging with 78% of interactions, capacity checks are stable,
and the guardian is escalated about once in five interactions, a sustainable
pattern. If `interaction_success_rate` drops below 0.5 or `ccc_trend` shifts
to `declining`, the system alerts the guardian that the PCP may need
re-evaluation. The agent observes; it does not diagnose.

---

## 6. Related Work

### 6.1 Rendering-Layer Accessibility Standards

WCAG 2.2 [7] governs how content is rendered; WCAG 3.0 [8] extends this to
authoring tools and user agents but remains a content standard. WAI-ARIA 1.2
[9] governs how widgets are described to assistive technology. PACE operates
at a different layer entirely: it governs how an agent *behaves*, what it
communicates, when, how much, and whether the principal can meaningfully engage
at this moment. These are complementary, not competing concerns.

### 6.2 Cognitive Accessibility and Dementia HCI

Lazar et al. [10] challenge the deficit-centered framing of dementia in HCI,
arguing that technology design has historically positioned people with dementia
as "deficient and declining." They advocate for *critical dementia* as a design
lens, designing *with* rather than *for*, and centering residual capacity and
agency rather than loss. PACE's `PrincipalCapabilityProfile` follows this
principle: it is not a disability label but a communication contract that
specifies what the principal *can* do, not what they cannot.

Contreras-Somoza et al. [11] find that people with cognitive impairment require
more time and assistance to complete tasks but can complete them, establishing
the empirical basis for PACE's extended timeouts and reduced option counts
rather than exclusion from interaction entirely.

Hernandez-Encuentra et al. [12] identify that current HCI for dementia
insufficiently addresses real-time adaptation to fluctuating cognitive state,
precisely the gap that `ConsentCapacityCheck` fills.

### 6.3 Temporal Capacity Fluctuation

The clinical literature on sundowning establishes the temporal dimension of
principal capacity. Khachiyants et al. [13] document that 20–45% of
Alzheimer's patients experience emergence or increment of neuropsychiatric
symptoms in late afternoon and evening, with neurophysiological mechanisms
involving degeneration of the suprachiasmatic nucleus. Canevelli et al. [14]
confirm that sundowning is associated with faster cognitive worsening and
greater caregiver burden. These findings establish that a principal who has
capacity to make a decision at 10:00 AM may lack that capacity at 6:00 PM,
a fluctuation that PACE's `sundown_block` and time-windowed interaction
rules directly address.

Trachsel et al. [15] demonstrate that cognitive fluctuations, a core feature
of dementia with Lewy bodies, also occurring in Parkinson's and Alzheimer's
, create intra-individual variability in decision-making capacity. Their
clinical guidance that informed consent should be repeated at least two
different times before a final decision provides the empirical warrant for
PACE's `ConsentCapacityCheck` as a per-interaction assessment rather than
a one-time determination. Capacity assessment in dementia is established as
task-specific and temporally variable [16]: even patients with moderate decline
may retain ability for specific decisions. No agent protocol prior to PACE
has encoded this clinical reality.

### 6.4 Informed Consent and Cognitive Impairment

Prusaczyk et al. [17] examine ethical challenges of including cognitively
impaired older adults, finding that capacity is not global in scope, a
person may have capacity for one decision type but not another. They recommend
scheduling consent processes when patients are cognitively at their best,
directly paralleling PACE's `valid_time_windows`. PACE formalizes
these clinical best practices as protocol-level invariants rather than
implementation guidelines.

### 6.5 Elder HCI

Knowles et al. [18] argue that accessibility alone is insufficient for older
adult technology adoption, broader contextual factors and holistic design
approaches are required. PACE's eight-dimensional capability model
responds to this by treating accessibility as a multi-faceted communication
contract rather than a single toggle.

Munteanu et al. [19] identify cognitive barriers (complex interfaces,
information overload), physical barriers (fine motor skill impairment), and
psychosocial barriers (fear of error) as three primary obstacle categories.
PACE's `max_options_per_turn`, `escalation_on_confusion`, and
`extended_timeout` address all three categories at the protocol level.

The critical turn in elder HCI [20] rejects homogenizing older adults as
"incapable technology users", recognizing heterogeneity within the aging
population. PACE's per-principal, versioned PCP embodies this: two
80-year-olds may have radically different capability profiles, and the
protocol treats each individually.

### 6.6 Voice Assistants and Assistive Technology

Pradhan et al. [21] find that voice-controlled assistants are adopted by
people with disabilities for unexpected accessibility use cases, "not
because they were intentionally designed for accessibility but as a byproduct
of the voice modality." The title finding, "accessibility came by accident"
, is a warning: accessibility for principals with disabilities cannot be
accidental in agent protocols; it must be structural.

Pellegrini et al. [22] establish that people with motor, linguistic, and
cognitive impairments *can* effectively interact with voice assistants, given
appropriate residual capacity. Critically, they find that severe cognitive
impairment can be compensated by normal linguistic skills, and vice versa,
demonstrating that capability dimensions interact in non-linear ways.
PACE's multi-dimensional PCP captures this: the system does not reduce a
principal to a single "impairment score" but maintains independent capability
dimensions that interact to determine the appropriate interaction modality.

### 6.7 Universal Design and Its Limits

The seven principles of Universal Design [23], most relevantly "Simple and
Intuitive Use" and "Perceptible Information", were designed for fixed
physical products and built environments. Ron Mace's original definition
deliberately avoided adaptation: "usable by all people, to the greatest
extent possible, without the need for adaptation." This anti-adaptation stance
is the key limitation for agent accessibility. An agent serving principals
with vastly different capabilities cannot achieve accessibility without
adaptation. PACE represents a post-Universal Design paradigm where
*dynamic individual adaptation* is the mechanism rather than a fixed design
accommodating all.

### 6.8 AI Fairness and Disability

Trewin [24] surveys how AI systems optimize for the "average" user,
systematically excluding people with disabilities. Guo et al. [25] identify
that AI technologies motivated by "improving the lives" of people with
disabilities may nonetheless fail them without deliberate fairness mechanisms.
Whittaker et al. [26] document from the AI Now Institute that disability
data is treated as "outlier data" and excluded from training sets, the
structural argument for why accessibility must be a protocol-level concern,
not an afterthought.

### 6.9 The Principal-Shaped Hole in the Protocol Stack

The emerging agent protocol stack maps to three communication boundaries:

| Boundary | Protocol | Principal Addressed? |
|----------|----------|---------------------|
| Agent ↔ Agent | A2A [3] | No; agents talking to agents |
| Agent ↔ Tool | MCP [4] | No; agents invoking tools |
| Agent ↔ Principal | *none prior to this work* | The gap |

A2A defines how agents discover, authenticate, and exchange tasks with each
other. The principal is the *reason* agents act, but A2A deliberately does not
govern the agent-to-principal boundary. MCP defines how agents call tools and
interpret results; the principal is absent entirely. UCP [5] and ACP [6] come
closest (both involve a human completing a purchase) but treat the principal
as a generic checkout endpoint, not as an individual with varying capabilities.
Google's Agent Payments Protocol (AP2) [32] acknowledges that agents must reach
humans at transaction boundaries for payment authorization, further confirming
that the industry recognizes the need without formalizing it.

Every real deployment has a principal at the end of the chain. An agent that
books a flight talks to airline agents (A2A), calls pricing tools (MCP), but
*someone* has to want the flight, approve the price, and feel satisfied with
the outcome. The industry treats this someone as an implementation detail.
PACE treats this someone as a protocol concern.

### 6.10 The Protocol-Layer Gap

No prior work addresses accessibility at this agent-to-principal boundary.
WCAG and ARIA operate at the rendering layer. Universal Design operates at the
product design layer. The cognitive accessibility and elder HCI literature
operates at the interaction design layer. The informed consent literature
operates at the clinical ethics layer. The closest sector-specific effort is
IEEE P3119 [30], which addresses AI procurement standards in healthcare,
including considerations for vulnerable populations, but operates at the
procurement and governance layer rather than the agent communication layer.
PACE is the first protocol to formalize accessibility as a protocol-level
primitive within the agent communication stack, extending A2A and MCP with
capability-aware interaction contracts that agents must satisfy before they
may interact with a principal.

---

## 7. Formal Safety Properties

A correct PACE implementation MUST satisfy all six:

**PCP-Sovereignty.** No remote agent may write, modify, or delete a
`PrincipalCapabilityProfile`. The PCP is on-device and principal/guardian
authoritative.

**IM-Precondition.** No agent may initiate interaction with a principal who
has a registered PCP without first computing an `InteractionModality` that
satisfies the PCP's `adaptations_required`.

**CCC-Gate.** For principals with `decision_capacity` ∈ {`fluctuating`,
`limited`, `guardian_required`}, no `ConsentRecord` (Anumati) may be created
without a preceding `ConsentCapacityCheck` with `recommendation` ∈ {`proceed`,
`simplify`}.

**AIC-Enforcement.** Violations of `AdaptiveInteractionContract` rules trigger
the declared `violation_policy`. Enforcement is automatic, not advisory.

**Privacy-Preservation.** `ConsentCapacityCheck` results, including
`capacity_signal` and `assessment_method`, MUST NOT be transmitted to any
remote agent or service provider. Provider agents learn only that an
interaction was deferred or that a guardian was escalated; they never learn why.

**Non-Diagnosis.** No PACE primitive produces, stores, or transmits a
clinical assessment. `capability_trajectory` in PACE's accessibility trace observes
interaction success rates; it does not diagnose cognitive decline. The
distinction is structural, not semantic: the system measures whether
interactions are succeeding, not whether the principal is impaired.

Four of these six properties (IM-Precondition, CCC-Gate, AIC-Enforcement
via time windows, AIC-Enforcement via option bounds) are encoded as TLA+
invariants in `specification/Pace.tla` of the companion repository, with
a TLC configuration that checks them over a small model (1 principal, 2
agents, 4 time slots). PCP-Sovereignty and Privacy-Preservation are
API-shape properties enforced by the type system and validators rather
than state-machine invariants.

---

## 8. Limitations and Future Work

1. **No empirical validation.** PACE is an architectural proposal. The
   four primitives and six invariants have not been tested with real
   principals or in deployed agent systems.
2. **Guardian trust as anchor.** The entire protocol depends on the
   guardian declaring an accurate PCP. A verified guardian with hostile
   intent could set `language: en` when the elder thinks in Telugu, or
   `cognitive: severe_decline` to pre-authorize escalation to themselves.
   PACE currently offers no secondary attestation path for the principal
   at lucid moments. A countermeasure worth exploring is dual-guardian
   co-signature for capability downgrades and periodic re-attestation
   windows where the principal can override if capacity allows.
3. **Categorical coarseness.** The eight capability dimensions use
   discrete levels (full, low, minimal, none) rather than continuous
   values. Real capability is continuous and often multi-dimensional
   within a single dimension (central vs peripheral vision, short-term
   vs long-term memory). We accept this coarseness for v1 as a trade
   for human-understandable profiles that guardians can declare without
   clinical training.
4. **Capacity signal scoring.** The `capacity_signal` in
   `ConsentCapacityCheck` is computed from passive signals (time of day,
   fatigue count, latency trend, response coherence) but the paper does
   not specify how these combine into a single number. The scoring
   function is deployment-specific; the companion repository's
   simulation harness is where calibration against specific populations
   will happen. A known confound: motor impairment (e.g., Parkinsonian
   tremor) produces slow response latency indistinguishable on the wire
   from cognitive fluctuation. The scoring function SHOULD condition on
   the PCP's motor dimension to discount latency as a cognitive signal
   when motor capability is low.
5. **Dependency on Anumati and Phala.** PACE extends both protocols. A
   deployment that does not implement Anumati or Phala can still use PCP
   and AIC independently, but the consent-capacity and welfare-aware
   satisfaction extensions require the companion protocols.

---

## 9. Conclusion

Agent protocols define rich semantics for authentication, consent, task
execution, and outcome evaluation. They define nothing about whether the
principal can perceive the agent's communication, process the information
presented, decide among the options offered, or consent to the actions
proposed. For 1.3 billion people with disabilities and every adult whose
capabilities are declining with age, this omission is not a gap, it is an
exclusion.

This paper addresses this exclusion with four primitives that make principal
capability a first-class protocol concern. The `PrincipalCapabilityProfile`
declares what the principal can do. The `InteractionModality` adapts the
agent's behavior to match. The `ConsentCapacityCheck` verifies that the
principal can meaningfully consent at this moment, not as a one-time
determination but as a per-interaction, temporally sensitive assessment
grounded in clinical evidence on cognitive fluctuation and sundowning. The
`AdaptiveInteractionContract` makes these adaptations enforceable, with
automatic violation consequences rather than advisory guidelines.

The protocol extends two existing protocol layers without modifying their
core primitives. When deployed alongside Anumati, consent becomes
accessibility-conditional: consent that was not capability-verified is
flagged as non-compliant. When deployed alongside Phala, satisfaction
measurement becomes capability-aware: a non-response from a principal who
could not see the notification is not scored as negative engagement.
Together, these extensions ensure that the welfare feedback loop
(Anumati at entry, Phala at exit) accounts for the principal's actual
ability to participate in the interactions being measured.

The protocol is agent-agnostic. Any agent network
that implements the four primitives gains a capability-aware interaction
path. The rendering-layer standards (WCAG, ARIA) remain necessary for UI
accessibility; PACE fills the layer above them, the behavioral layer
where the agent decides *what* to say, *when* to say it, *how much* to say,
and *whether the principal can engage at all*.

We demonstrate the protocol in an agent interaction
scenario involving an elder principal with accessibility needs, where
accessibility is existential rather than aspirational. But the contribution
is universal. Every A2A task, every MCP
tool call, every UCP checkout, every ACP purchase assumes a capable
principal. PACE makes that assumption explicit, testable, and, when
it fails, adaptable.

---

## References

[1] Kadaboina, R. K. *Anumati: Proof of Adherence as a Formal Consent Model
    for Autonomous Agent Protocols*. arXiv:2604.16524 [cs.CR], 2026.
    https://doi.org/10.48550/arXiv.2604.16524

[2] Kadaboina, R. K. *Phala: Principal-Declared Welfare Feedback for
    Autonomous Agent Networks*. Zenodo, 2026.
    https://doi.org/10.5281/zenodo.19625611

[3] Linux Foundation AI & Data. *Agent2Agent (A2A) Protocol Specification*,
    2026. <https://a2aproject.org>

[4] Anthropic. *Model Context Protocol Specification*, November 2025.
    <https://modelcontextprotocol.io>

[5] Shopify & Google. *Universal Commerce Protocol (UCP)*, 2026.
    https://ucp.dev

[6] OpenAI & Stripe. *Agentic Commerce Protocol (ACP)*, 2025.
    https://www.agenticcommerce.dev

[7] World Wide Web Consortium (W3C). *Web Content Accessibility Guidelines
    (WCAG) 2.2*. W3C Recommendation, 5 October 2023.
    <https://www.w3.org/TR/WCAG22/>

[8] W3C. *WCAG 3.0 Requirements*. W3C Draft Note, December 2024.
    <https://www.w3.org/TR/2024/DNOTE-wcag-3.0-requirements-20241212/>

[9] Craig, J., Cooper, M., Fiers, M., Nurthen, J., and Pugh, L. (Eds.).
     *Accessible Rich Internet Applications (WAI-ARIA) 1.2*. W3C
     Recommendation, 6 June 2023. <https://www.w3.org/TR/wai-aria-1.2/>

[10] Lazar, A., Edasis, C., and Piper, A. M. A Critical Lens on Dementia
     and Design in HCI. *CHI 2017*, pp. 2175–2188. ACM.

[11] Contreras-Somoza, L. M., et al. Usability and User Experience of
     Cognitive Intervention Technologies for Elderly People With MCI or
     Dementia: A Systematic Review. *Frontiers in Psychology*, 12, 636116,
     2021.

[12] Hernández-Encuentra, E., et al. State-of-the-Art HCI for Dementia Care:
     A Scoping Review of Recent Technological Advances. *Disabilities*, 2(4),
     2024.

[13] Khachiyants, N., Trinkle, D., Son, S. J., and Kim, K. Y. Sundown
     Syndrome in Persons with Dementia: An Update. *Psychiatry Investigation*,
     8(4):275–287, 2011.

[14] Canevelli, M., et al. Sundowning in Dementia: Clinical Relevance,
     Pathophysiological Determinants, and Therapeutic Approaches. *Frontiers
     in Medicine*, 3:73, 2016.

[15] Trachsel, M., Hermann, H., and Biller-Andorno, N. Cognitive Fluctuations
     as a Challenge for the Assessment of Decision-Making Capacity in Patients
     With Dementia. *American Journal of Alzheimer's Disease & Other
     Dementias*, 30(4):360–363, 2015.

[16] Hegde, S., and Ellajosyula, R. Capacity Issues and Decision-Making in
     Dementia. *Annals of Indian Academy of Neurology*, 19(Suppl 1):S34–S39,
     2016.

[17] Prusaczyk, B., Cherney, S. M., Carpenter, C. R., and DuBois, J. M.
     Informed Consent to Research with Cognitively Impaired Adults:
     Transdisciplinary Challenges and Opportunities. *Clinical Gerontologist*,
     40(1):63–73, 2017.

[18] Knowles, B., Rogers, Y., Waycott, J., Hanson, V. L., Piper, A. M., and
     Davies, N. HCI and Aging: Beyond Accessibility. *CHI EA 2019*. ACM.

[19] Munteanu, C., et al. Designing for Older Adults: Overcoming Barriers
     toward a Supportive, Safe, and Inclusive Environment. Pension Research
     Council Working Paper 2018-17. The Wharton School, 2018.

[20] Waycott, J., Vetere, F., and Ozanne, E. HCI and Older Adults: The
     Critical Turn and What Comes Next. *International Journal of
     Human-Computer Studies*, 183, 103198, 2025.

[21] Pradhan, A., Mehta, K., and Findlater, L. "Accessibility Came by
     Accident": Use of Voice-Controlled Intelligent Personal Assistants by
     People with Disabilities. *CHI 2018*, Paper 459, pp. 1–13. ACM.

[22] Pellegrini, L., et al. Investigating the Accessibility of Voice
     Assistants With Impaired Users: Mixed Methods Study. *Journal of Medical
     Internet Research*, 22(9):e18431, 2020.

[23] Connell, B. R., Jones, M., Mace, R., et al. *The Principles of
     Universal Design, Version 2.0*. Center for Universal Design, North
     Carolina State University, 1997.

[24] Trewin, S. AI Fairness for People with Disabilities: Point of View.
     arXiv:1811.10670, 2018.

[25] Guo, A., Kamar, E., Vaughan, J. W., Wallach, H., and Morris, M. R.
     Toward Fairness in AI for People with Disabilities: A Research Roadmap.
     *ACM SIGACCESS Accessibility and Computing*, 125, 2019.

[26] Whittaker, M., Alper, M., Bennett, C. L., et al. *Disability, Bias,
     and AI*. AI Now Institute, New York University, 2019.

[27] Sarvam AI. *Sarvam-M: Open Source Hybrid Indic LLM*. February 2026.
     Supports all 22 scheduled Indian languages with voice-first real-time
     inference. Developed under India's IndiaAI Mission.
     <https://www.sarvam.ai/blogs/sarvam-m/>

[28] Grisso, T., and Appelbaum, P. S. *MacArthur Competence Assessment
     Tool for Treatment (MacCAT-T)*. Professional Resource Press, 1998.

[29] World Health Organization. *Global Report on Assistive Technology*.
     WHO and UNICEF, 2022. <https://www.who.int/publications/i/item/9789240049451>

[30] IEEE Standards Association. *IEEE P3119: Standard for the Procurement
     of Artificial Intelligence and Automated Systems in Healthcare*.
     In development, 2024.

[31] Federal Bureau of Investigation. *2023 Elder Fraud Report*. Internet
     Crime Complaint Center (IC3), 2024.
     https://www.ic3.gov/Media/PDF/AnnualReport/2023_IC3ElderFraudReport.pdf

[32] Google. *Agent Payments Protocol (AP2)*. 2026.
     https://ap2-protocol.org
