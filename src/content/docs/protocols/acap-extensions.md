---
title: ACAP Extensions
description: Four reference extensions that layer on top of Anumati / ACAP Core — tiered escalation, sensitivity preferences, regulatory context, and audit projection.
---

Anumati Core defines the three-primitive consent chain specified in the
paper. These four extensions layer on top of Core to address specific
deployment concerns: alert fatigue from version bumps, asymmetric
sensitivity across data categories, jurisdictional floors that cannot
be lowered by the principal, and regulator-facing report rendering.

Each extension is a reference implementation in the parent repository.
Extensions do not carry individual DOIs. They evolve in the same
repository as Core and are expected to graduate or be superseded as
downstream consumers (guardian extensions, A2A working-group efforts,
commercial governance services) build on them.

## Governance Tiering

**Problem.** Every policy version bump under ACAP Core produces a
re-consent prompt. In high-throughput deployments that creates alert
fatigue, the principal learns to click through, and the information
content of the consent collapses toward zero.

**Design.** A supervisory governance agent classifies each diff into
one of three tiers (auto-approved, governance-reviewed, human-required)
using structural signals computed mechanically from the diff. The
classification is itself recorded on the `ConsentRecord` as an
`EscalationAssessment` so an auditor can see not only what was
accepted but who decided the acceptance could proceed without the
principal.

| Primitive | What it records |
|---|---|
| `EscalationTier` | Tier assigned to this re-consent |
| `MaterialitySignal` | One structural signal that fired on the diff |
| `EscalationAssessment` | Full classification record with signals and review metadata |
| `DelegationChain` | Multi-hop A→B→C consent path with per-hop tiers |

Formal verification: invariants S8 (`GovernanceAlwaysReviews`) and S9
(`HumanRequiredHonoured`) in `ConsentLifecycle.tla`, model-checked
under TLC.

- **Stage:** Reference implementation
- **Rationale:** [extensions/governance-tiering/motivation.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/governance-tiering/motivation.md)
- **Status:** [extensions/governance-tiering/STATUS.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/governance-tiering/STATUS.md)
- **Code:** [src/acap/extensions/governance_tiering/](https://github.com/ravikiran438/agent-consent-protocol/tree/main/src/acap/extensions/governance_tiering)
- **Tests:** 24 passing

## Category Preferences

**Problem.** ACAP Core treats every claim as equally weighted. A
principal cares about biometric storage very differently from
financial aggregation, and differently at a pharmacy versus a cosmetic
surgery app. The protocol needs to carry that asymmetry per-callee.

**Design.** A two-axis sensitivity matrix travels with each
`ConsentRecord`: nine data categories (biometric, health, financial,
location, behavioral, identity, communications, minor-or-dependent,
operational) crossed with eight usage dimensions (storage, access,
third-party sharing, automated decision, training, aggregation,
cross-context use, deletion or portability). The principal assigns
LOW, MEDIUM, or HIGH sensitivity to each cell they care about;
uncovered cells resolve to LOW.

| Primitive | What it records |
|---|---|
| `DataCategory` | Closed enum of 9 data categories |
| `UsageDimension` | Closed enum of 8 usage dimensions |
| `CategorySensitivity` | LOW, MEDIUM, or HIGH |
| `CategoryPreference` | One cell of the matrix, with optional principal-authored note |
| `resolve_sensitivity` | Lookup with specific-cell-wins-over-default-row semantics |

- **Stage:** Reference implementation
- **Rationale:** [extensions/category-preferences/motivation.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/category-preferences/motivation.md)
- **Status:** [extensions/category-preferences/STATUS.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/category-preferences/STATUS.md)
- **Code:** [src/acap/extensions/category_preferences/](https://github.com/ravikiran438/agent-consent-protocol/tree/main/src/acap/extensions/category_preferences)
- **Tests:** 13 passing

## Regulatory Context

**Problem.** Jurisdictional frameworks ([HIPAA](https://www.hhs.gov/hipaa/index.html),
[GDPR](https://gdpr-info.eu/),
[PCI-DSS](https://www.pcisecuritystandards.org/),
[CCPA](https://oag.ca.gov/privacy/ccpa),
[EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai),
[COPPA](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa))
govern *organizations*, not agents. The compliance obligation flows
through delegation: a hospital's HIPAA obligations apply to its
scheduling agent, regardless of what the callee's policy permits or
the principal personally prefers. The floor the framework imposes
cannot be lowered by either party.

**Design.** A framework-tagged envelope carrying `ComplianceObligation`
entries, attached to both `PolicyDocument` (callee's posture) and
`ConsentRecord` (caller's posture). Each obligation is expressed on
the same (category, dimension) grid as the category-preferences
extension, and the effective floor for any cell is the strictest
applicable value across principal preferences, callee declaration,
and caller declaration.

| Primitive | What it records |
|---|---|
| `RegulatoryFramework` | Closed enum of 8 frameworks (GDPR, HIPAA, PCI-DSS, CCPA, EU AI Act, COPPA, SOC2, FINRA) |
| `ComplianceObligation` | A single requirement as (framework ref, affected categories, affected dimensions, minimum sensitivity) |
| `RegulatoryContext` | A party's declared posture under one framework |
| `compute_floor` | Strictest-across-sources sensitivity for a (category, dimension) query |

The extension ships the **envelope**. Per-framework mappings from
statute text to `(category, dimension, minimum_sensitivity)` tuples
require qualified legal review and are explicitly out of scope for the
reference implementation.

- **Stage:** Reference implementation (envelope); per-framework mappings blocked on qualified legal review
- **Rationale:** [extensions/regulatory-context/motivation.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/regulatory-context/motivation.md)
- **Status:** [extensions/regulatory-context/STATUS.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/regulatory-context/STATUS.md)
- **Code:** [src/acap/extensions/regulatory_context/](https://github.com/ravikiran438/agent-consent-protocol/tree/main/src/acap/extensions/regulatory_context)
- **Tests:** 16 passing

## Audit Projection

**Problem.** The consent chain and adherence trail are built for
machines. The humans who actually consume audit data are compliance
officers, data-protection lawyers, regulators, and principals. A JSON
dump of a linked list does not answer the questions any of them are
paid to ask.

**Design.** A deterministic projection function walks the chain and
trail for a scoped `(caller, callee, window, filters)` request and
produces a structured report with three parts: an executive summary,
a chronological timeline where every narrative entry carries a
back-reference to the source record, and per-claim and per-version
statistical breakdowns. Narrative prose may differ across conformant
implementations; cross-references and counts are byte-identical.

| Primitive | What it records |
|---|---|
| `AuditReport` | Top-level projection for one caller-callee pair over a time window |
| `AuditEntry` | One timeline event with narrative and back-reference |
| `AuditEntryType` | Closed enum of 10 event types |
| `ClaimAuditSummary` | Per-claim statistics (total, permit, deny, escalate) |
| `VersionAuditSummary` | Per-policy-version statistics |
| `generate_report` | The projection function |

Intended regulatory touchpoints: [GDPR Recital 71](https://gdpr-info.eu/recitals/no-71/)
and [Art. 13(2)(f)](https://gdpr-info.eu/art-13-gdpr/) /
[14(2)(g)](https://gdpr-info.eu/art-14-gdpr/) "meaningful information
about the logic involved" for automated decision-making under
[Art. 22](https://gdpr-info.eu/art-22-gdpr/), and
[EU AI Act Annex IV](https://artificialintelligenceact.eu/annex/4/)
technical-documentation requirements for high-risk deployments.

- **Stage:** Reference implementation
- **Rationale:** [extensions/audit-projection/motivation.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/audit-projection/motivation.md)
- **Status:** [extensions/audit-projection/STATUS.md](https://github.com/ravikiran438/agent-consent-protocol/blob/main/extensions/audit-projection/STATUS.md)
- **Code:** [src/acap/extensions/audit_projection/](https://github.com/ravikiran438/agent-consent-protocol/tree/main/src/acap/extensions/audit_projection)
- **Tests:** 19 passing

## How They Compose

The four extensions stack deliberately:

1. **Category Preferences** provides the two-axis grid (category x dimension) on which every other extension speaks.
2. **Regulatory Context** uses the same grid as its encoding surface; `compute_floor` composes principal preferences with every declared regulatory context and returns the strictest cell.
3. **Governance Tiering** consults the effective floor when classifying a re-consent diff; a `HIGH` cell is a candidate for automatic `HUMAN_REQUIRED` escalation regardless of the structural signals on the diff.
4. **Audit Projection** renders the full history into a regulator-facing report; the `AuditEntryType` enum already reserves `GOVERNANCE_AUTO`, `GOVERNANCE_REVIEWED`, and `HUMAN_REVIEW` entries so a deployment that layers governance-tiering can surface those decisions in the timeline.

The Core paper at [arXiv:2604.16524](https://arxiv.org/abs/2604.16524) (also [Zenodo DOI 10.5281/zenodo.19606339](https://doi.org/10.5281/zenodo.19606339)) specifies the three primitives these extensions build on. Extensions are maintained in the same repository and do not currently carry individual DOIs.

## MCP Server

One primary entry point per extension ships as an MCP tool alongside
the Core validators, via the `acap-mcp` reference server: `classify_policy_bump` (governance tiering),
`resolve_sensitivity` (category preferences), `compute_floor`
(regulatory context), `generate_audit_report` and
`validate_audit_report` (audit projection). See
[MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers)
for install and VSCode configuration.
