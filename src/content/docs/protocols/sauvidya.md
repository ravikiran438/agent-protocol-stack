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

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19633139](https://doi.org/10.5281/zenodo.19633139)
- **Repository:** [github.com/ravikiran438/sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace)
- **Extension URI:** `https://github.com/ravikiran438/sauvidya-pace/v1`
- **Tests:** 32 passing
- **MCP server:** `pace-mcp` (see [MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers))
- **License:** Apache 2.0
