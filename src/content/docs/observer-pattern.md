---
title: The Observer Pattern
description: A passive third-party agent that taps inter-agent traffic without sitting on the message path. Why A2A doesn't define one, what the spec leaves to deployment, and how the testbed implements it.
---

A2A 1.0 defines a strictly bilateral exchange — sender, receiver,
nothing in between. But real multi-agent deployments routinely need a
**passive third party** that watches the conversation without sitting
on the message path: for audit trails, behavioral integrity checks,
or invariants that span the traffic graph rather than any single
agent. The A2A specification itself doesn't define such a role; it
leans on existing standards (OpenTelemetry, sidecars, webhooks) and
leaves the assembly to deployment.

This page explains the gap, the assembly costs of the spec's
minimalist approach, and the observer pattern as one ergonomic way
to fill it for scenario testing and (with different infrastructure)
for production. The reference implementation is part of
[a2a-testbed](https://github.com/ravikiran438/a2a-testbed); the
live playground at <https://a2a-testbed.com> renders the bundled
three-party scenario with the observer toggle visible.

## What it is, in plain terms

An **observer** is an agent that participates in a scenario but never
appears as the `from` or `to` of any step. The runtime broadcasts a
copy of every message — and optionally the wire-level
request/response pair — to every registered observer. It's a
*fan-out tap*, not a man-in-the-middle: the message flow between the
actual agents is untouched.

Declared in YAML the way any other agent is, just with a different
role:

```yaml
agents:
  - id: caller
    card: ./carol.json
  - id: callee
    card: ./alice.json
  - id: nerve_observer
    card: ./bob.json
    role: observer       # ← the one extra line
```

After the scenario runs, you can ask the hub
`history("nerve_observer")` and walk every traffic record the
observer saw, in order.

## Where the A2A spec stops

A2A 1.0 specifies five primitives — `AgentCard`, `Task`, `Message`,
`Artifact`, `Part` — and the wire format that connects sender to
receiver. **Nothing about a third party.** That's deliberate: the
spec sticks to the wire layer and leaves audit, monitoring, and
integrity concerns to deployment.

The spec mentions monitoring and tracing as **enterprise-ready
capabilities**, but only by reference: it expects you to use existing
standards rather than introducing A2A-specific ones.

### How A2A handles monitoring today

The spec's recommended path:

| Concern | Recommended tool |
|---|---|
| Single-agent traces | OpenTelemetry, standard W3C trace context headers, vendor APMs |
| Auth + identity | OAuth, IAM, OpenAPI auth conventions |
| Health endpoints | Whatever your service framework provides |
| Per-agent metrics | Prometheus, vendor metrics pipelines |

For a single agent, this stack works. Each agent emits OpenTelemetry
spans with a propagated trace ID; you assemble the trace at the
collector; a vendor APM renders it.

**The gap shows up at multi-agent invariants.** Examples:

- "Every `request_consent` step produces an `AdherenceEvent` somewhere
  in the network, signed by an agent with delegated authority."
- "Agent X's behavioral fingerprint doesn't drift more than δ across
  the conversation, accounting for the cohort it's interacting with."
- "Every message Alice sends to Bob is acknowledged within N ticks,
  regardless of which agent eventually answers."

Each of these is an invariant on the *traffic graph*, not on any
single agent. To check them with the spec's recommended stack, you
have to:

1. Get every agent to emit traces with a shared correlation ID.
2. Get them all to push traces to a common collector (often
   third-party like Honeycomb, Datadog, Jaeger).
3. Write a custom query layer that joins the traces, materializes
   the relevant events, and applies the invariant.
4. Run that query layer continuously, with alerting hooked in for
   violations.

This works at scale, but the assembly cost is real:

- **Every agent must cooperate.** Agents from different teams, vendors,
  or runtimes need to agree on instrumentation conventions. A new
  agent joining the network is a new integration project.
- **Correlation IDs cross trust boundaries.** Trace IDs propagating
  across organizational boundaries (a callee at Org B receiving a
  caller's correlation ID from Org A) require careful privacy review.
- **Invariants live as queries, not as code.** SLO dashboards and
  alerting rules are easy to drift from the actual specification of
  the invariant.

The spec isn't *wrong* to leave this to deployment — it's protocol
minimalism, and that's a defensible design choice. But it does mean
multi-agent observation isn't "in the box."

## Spec-aligned alternatives in production

The closest places where someone might tap traffic without each
agent's deep cooperation:

| Approach | How it lands relative to spec |
|---|---|
| **Service-mesh sidecar** (Envoy / Istio / Linkerd) tapping HTTP | Spec-orthogonal. Works for any HTTP-based protocol; A2A doesn't care. |
| **Webhook from each agent** to a logging endpoint | Spec-orthogonal. Each agent opts in. |
| **Per-step extension** carrying audit metadata in `capabilities.extensions[]` | Spec-aligned mechanism, but each agent has to cooperate by emitting it. |
| **External proxy** in front of every agent | Spec-orthogonal. Doesn't require agent participation. |
| **Testbed observer role** (this pattern) | Test-environment only. Demonstrates the shape; not a production deployment. |

None of these are *defined by* A2A; all of them are *consistent with*
it. The observer pattern sits at the same layer as the others — a
deployment-pattern choice, not a protocol primitive.

## How the testbed implements it

Two granularities, one hub.

### Step record — what the scenario *intended*

```python
@dataclass
class TrafficRecord:
    step_index: int
    step: Step           # the YAML step (from, to, action, expectations)
    result: StepResult   # ok / failed; latency; the bytes the runner saw
```

### Wire exchange — what actually crossed the network seam

```python
@dataclass
class WireExchange:
    receiver_id: str
    request_body: dict
    response_body: dict
```

The `ObserverHub` keeps a per-observer list of both. The scenario
runner emits `TrafficRecord`s on every step; the multi-tenant network
(or the per-process network, in realistic mode) emits
`WireExchange`s from its request-handler tap. An observer can read
either or both.

The hub is **passive** — observers don't return responses; they
don't influence routing. You can register zero, one, or many. If
none are registered, the hub short-circuits at zero cost.

## Why this pattern matters

Three concrete invariants people want to check that **can't be
checked from one agent's perspective alone**:

1. **Audit-trail completeness.** Did every consent step produce an
   event? The original consent agent only sees its own traffic; an
   observer sees the whole conversation.
2. **Behavioral drift across a cohort.** Did agent X's outputs
   accumulate a fingerprint that diverges from baseline over the
   scenario's runtime? The drift detector needs to see *every*
   output, not just the ones it produced.
3. **Cross-agent invariants** like *"every message Alice sends to Bob
   is followed by Bob acknowledging within N ticks."* That's an
   invariant on the traffic graph, not on either endpoint.

In every case the alternative — instrumenting every agent and
merging logs into a query layer — is what production teams already
do, often badly. The observer pattern moves it from "every agent
must cooperate" to "register one observer per scenario."

## What this pattern doesn't claim

- **It's not a security primitive.** An observer in the testbed runs
  in-process; in production, network-level observation requires real
  infrastructure (TLS termination, sidecar identity, retention
  policies, etc.) that's out of testbed scope.
- **It's not in the A2A spec.** No claim that it is. The spec stays
  where it is — bilateral exchanges only.
- **It's not unique.** The shape is borrowed from service-mesh
  tracing, ESB audit subscribers, and biological microglial defense.
  The contribution here is making it ergonomic for multi-agent A2A
  scenario testing.

## When to use which

| Need | Tool |
|---|---|
| Inspect what one agent did during one task | Single-agent debugging tool, the agent's own logs, OpenTelemetry traces |
| Drive a multi-agent scenario and check end-to-end invariants | Testbed observer (this pattern) |
| Production multi-agent observability under load | Service-mesh sidecar + collector + custom invariant queries (or per-step extension if your agents cooperate) |
| Production audit trail with retention + access control | External proxy or per-agent webhook into an audit DB with proper retention policies |

The testbed observer is the *cheapest* version of the pattern: zero
infrastructure, in-process, scenario-bounded. It exists so you can
**see the pattern at work** before deciding which production form
fits your stack.

## Inspired by

The shape of this pattern — a passive third-party agent that taps
wire exchanges and compares observed behavior to a published
baseline — draws directly on prior work in two companion
specifications:

- **[Pratyahara / NERVE](/agent-protocol-stack/protocols/pratyahara/)** —
  a multi-agent behavioral integrity model where *microglial
  observer* agents continuously compare an agent's output
  distribution to its baseline fingerprint and flag *drift* when the
  distribution diverges. The microglial framing is what justifies
  passive observation: the observer doesn't act on traffic, it just
  records and evaluates.
- **Yathartha** (the NERVE jaggedness extension) — a refinement
  that distinguishes *drift* (change from a known baseline) from
  *jaggedness* (no baseline ever existed). Without that distinction,
  observers raise false drift flags on tasks the agent was never
  measured on. Yathartha gives observers the discipline to know when
  silence is meaningful.

The testbed observer is the **generic shape only** — it doesn't
commit to either the fingerprint algorithm or the capability-surface
model. You attach the semantic validator your protocol needs; the
testbed gives you the wire-level traffic tap to plug it into.

## Where to look in the testbed code

Implementation files in the
[a2a-testbed](https://github.com/ravikiran438/a2a-testbed) repo:

- [`src/a2a_testbed/core/observer.py`](https://github.com/ravikiran438/a2a-testbed/blob/main/src/a2a_testbed/core/observer.py) —
  `ObserverHub`, `TrafficRecord`, `WireExchange`
- [`examples/scenarios/observer_audit.yaml`](https://github.com/ravikiran438/a2a-testbed/blob/main/examples/scenarios/observer_audit.yaml) —
  minimal demonstration scenario
- [`src/a2a_testbed/network/multitenant.py`](https://github.com/ravikiran438/a2a-testbed/blob/main/src/a2a_testbed/network/multitenant.py) —
  request-handler tap that forwards wire exchanges to the hub

The live playground at <https://a2a-testbed.com> renders the
pattern interactively: Scenario mode, **Add Observer** toggle.

## Net summary

The spec doesn't have an observer; production already needs one for
any non-trivial multi-agent invariant; the testbed offers it as a
scenario-runner role you can attach to any flow. When the spec
eventually adds something equivalent (or when service-mesh
integrations standardize), the testbed's observer gets supplemented,
not replaced — same plug-points, just wired to a different source of
traffic.
