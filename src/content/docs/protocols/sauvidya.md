---
title: Sauvidya / PACE
description: Principal Accessibility & Capacity Envelope — accessibility for agent-to-principal interaction.
---

**Sauvidya** (Sanskrit for *with proper knowledge*) defines the **PACE**
specification: **P**rincipal **A**ccessibility & **C**apacity **E**nvelope.

## The Gap

Agent protocols assume the principal can see, hear, read, comprehend,
decide in real time, and maintain consistent cognitive capacity across
interactions. For the estimated 1.3 billion people worldwide living with
some form of disability, and for every adult whose capabilities are
declining with age, this assumption is structurally exclusionary.

WCAG and ARIA govern the rendering layer (color contrast, screen readers).
PACE governs the behavioral layer: what the agent communicates, when, how
much, how many options it presents, how long it waits, and whether the
principal can consent at this moment.

## Four Primitives

| Primitive | What it does |
|---|---|
| `PrincipalCapabilityProfile` | On-device declaration of the principal's capabilities across eight dimensions |
| `InteractionModality` | Agent's adapted communication plan computed from the PCP |
| `ConsentCapacityCheck` | Per-interaction verification that the principal can meaningfully consent right now |
| `AdaptiveInteractionContract` | Binding rules governing how all agents interact with this principal |

## Eight Capability Dimensions

| Dimension | Range |
|---|---|
| Vision | full, low, minimal, none |
| Hearing | full, partial, minimal, none |
| Motor | full, limited, minimal, assistive_device |
| Cognitive | full, mild_decline, moderate_decline, severe_decline |
| Language | list of (language code, fluency score) |
| Literacy | full, functional, limited, none |
| Tech fluency | high, moderate, low, none |
| Decision capacity | stable, fluctuating, limited, guardian_required |

## Optional Compositions

PACE works standalone. When deployed alongside other protocols:

- **With consent protocols:** consent becomes accessibility-conditional.
  A ConsentCapacityCheck must pass before any ConsentRecord is created.
- **With welfare protocols:** satisfaction measurement becomes
  capability-aware. A non-response from a principal who could not see
  the notification is not scored as negative engagement.
- **With payment protocols (AP2):** payment authorization becomes
  accessible. A voice confirmation in Telugu replaces a payment-detail
  screen the principal cannot read.

## Augmentation Profile Extension

The [augmentation_profile extension](https://github.com/ravikiran438/sauvidya-pace/tree/main/extensions/augmentation_profile)
extends PACE from defensive accommodation toward active prosthetic
augmentation. PACE Core declares what the principal can do and adapts
the agent's interaction surface to fit. The extension adds the
missing piece: how an agent *actively replaces* missing capacity or
*amplifies* existing strengths, with contractual safeguards against
skill atrophy, identity erosion, and missed-emergency risk.

| Primitive | What it records |
|---|---|
| `AugmentationAxis` | A single dimension with kind: `compensate`, `amplify`, or `preserve` |
| `AugmentationProfile` | Per-principal declaration with reversibility, audit, identity, skill-maintenance, and emergency rules |
| `AugmentationAction` | A logged action with a `mediation` field distinguishing agent-compensated, agent-amplified, user-direct, and agent-handed-off |
| `EmergencyTrigger` / `HandoffEvent` | Declared crisis conditions and the typed handoff event that follows |
| `AxisRevertedEvent` | Typed reversion event recording principal opt-out of any axis |

| Invariant | Purpose |
|---|---|
| AUG-1 Reversibility | Every augmentation is revertible by the principal as a typed event |
| AUG-2 Audit Decomposition | Every action records its mediation (no aggregation that erases agency) |
| AUG-3 Identity Preservation | Voice/style alteration requires explicit `identity_consent` |
| AUG-4 Skill Maintenance | `preserve` axes are never replaced by agent action |
| AUG-5 Emergency Boundary | Triggers force human handoff; no further agent action until acknowledgement |

Full specification with TLA+ model and TLC configuration at
[`extensions/augmentation_profile/`](https://github.com/ravikiran438/sauvidya-pace/tree/main/extensions/augmentation_profile).
The extension is additive: agents that do not declare an
`AugmentationProfile` continue to operate under PACE Core's existing
defensive-accommodation model.

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19633139](https://doi.org/10.5281/zenodo.19633139)
- **Repository:** [github.com/ravikiran438/sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace)
- **Extension URI:** `https://github.com/ravikiran438/sauvidya-pace/v1`
- **Tests:** 96 passing (Core + augmentation_profile + MCP)
- **MCP server:** `pace-mcp` — 11 tools (7 Core + 4 augmentation_profile); see [MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers)
- **License:** Apache 2.0
