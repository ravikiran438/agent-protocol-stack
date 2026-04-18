---
title: How They Compose
description: The four protocols are independent but composable. Here is what happens when you deploy them together.
---

## Independence

Each protocol works alone. You can deploy ACAP without Phala, NERVE
without PACE, or any single protocol in isolation. The primitives are
self-contained and the `capabilities.extensions` entries are independent.

## Composition

When multiple protocols are deployed on the same AgentCard, they produce
compound guarantees:

### PACE + ACAP (Accessibility + Consent)

Consent becomes accessibility-conditional. Before creating a
`ConsentRecord` (ACAP), the system performs a `ConsentCapacityCheck`
(PACE) to verify the principal can meaningfully consent right now.
Consent given during sundowning hours or without the principal's
language support is flagged as non-compliant.

### PACE + Phala (Accessibility + Welfare)

Satisfaction measurement becomes capability-aware. Phala's implicit
signals (response time, engagement) are normalized against the
principal's declared capabilities. A 200-second response from a
principal with `response_timeout: 300s` is fast, not slow.

### NERVE + ACAP (Integrity + Consent)

Trust-triggered re-consent. When NERVE's `MicroglialObserver` drops an
agent's `trust_score` below 0.4, any active consent records for that
agent are invalidated. The agent must re-establish consent before acting
on the principal's behalf.

### NERVE + Phala (Integrity + Welfare)

Outcome valence drives myelination. Phala's positive/negative valence
signals strengthen or weaken NERVE's `SynapticChannel` myelination,
creating a feedback loop where well-performing pathways become faster
and poorly-performing ones are attenuated.

### All Four Together

The full lifecycle:

1. **PACE** checks: can this principal participate?
2. **ACAP** checks: has the caller honored the callee's terms?
3. **NERVE** checks: is this agent still trustworthy?
4. **Phala** measures: did the action serve the principal?

Each phase feeds the next. Accessibility gates consent. Consent gates
action. Integrity monitors the action. Welfare evaluates the result.
The result feeds back into trust (NERVE myelination) and future routing
(Phala BeliefUpdate), closing the loop.

## On the AgentCard

All four protocols declare themselves in the same `capabilities.extensions`
array. See [For A2A Developers](/agent-protocol-stack/developers/) for the
full AgentCard example.
