---
title: "Phala: Principal-Declared Welfare Feedback for Autonomous Agent Networks"
description: "Full paper. A principal-declared welfare feedback protocol for agent-to-agent networks."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Phala: Principal-Declared Welfare Feedback for Autonomous Agent Networks*. Zenodo, 2026. [doi:10.5281/zenodo.19625611](https://doi.org/10.5281/zenodo.19625611). Repository: [github.com/ravikiran438/phala-protocol](https://github.com/ravikiran438/phala-protocol).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

*Phala* is Sanskrit for "fruit" or "the outcome of action."

---

## Abstract

Autonomous agent protocols define rich entry conditions for action:
authentication establishes *who* may act; consent models establish *under
what conditions* a permitted action may be taken. Neither addresses what
happens after an action resolves: whether the outcome served the principal,
and whether the agents involved should behave differently next time. We
formalize this as the *outcome gap*. We further identify a structural
inversion at the heart of existing feedback mechanisms: in every current
protocol-layer system that routes outcome signals (reinforcement learning
from human feedback at training time, multi-agent reward models, and
advertising-oriented context protocols), the service provider defines what
a good outcome means. The principal does not.

We propose five primitives that together constitute a principal-declared
welfare feedback protocol for agent-to-agent networks: `OutcomeEvent`
(objective facts of task resolution), `SatisfactionRecord` (quality signal),
`BeliefUpdate` (derived weight adjustment, privacy-preserving by invariant),
`PrincipalSatisfactionModel` (per-context, principal-authored declaration of what
*good* means for the principal), and `WelfareTrace` (longitudinal welfare
signal that modulates the learning rate of the entire network based on
whether the principal is gaining or losing autonomy over time). We
instantiate the model as extensions to the Agent2Agent (A2A) protocol and
the Model Context Protocol (MCP).

---

## 1. Introduction

AI agents are deployed at scale inside enterprise systems. Measurement
of their value is not. This pattern is observed repeatedly across
enterprise deployments. Teams integrate retrieval-augmented generation
pipelines, model context servers, and multi-agent routing layers into
production workflows. The integrations ship. Whether they improve
outcomes for the people using them (whether they reduce task completion
time, lower error rates, decrease cognitive load) is treated as a
post-launch concern. In practice it is never revisited. The agents run.
Whether they run well is inferred from the absence of complaints.

This is not an organizational failure. It is a structural gap in the
agent protocol stack. Protocols for agent communication define rich lifecycle
semantics: tasks are submitted, worked, completed or failed. They define how
authentication tokens are validated, how policy claims are evaluated before
action, how results are returned as structured artifacts. They define
everything about the call except whether the call was worth making.

The gap has a specific shape. Consider a personal agent that monitors a
user's time-sensitive obligations and nudges them at the predicted optimal
moment. The agent has a model of when the user is receptive and updates
that model through experience. But on what signal? Current agent protocols
provide no mechanism for the resolution of a downstream task to propagate
back as a learning signal to the upstream agents that initiated it. Each
task completes into a void.

There is a subtler problem beneath the routing gap. Every existing
protocol-layer mechanism that propagates outcome signals (reinforcement
learning from human feedback (RLHF) at training time, multi-agent
reinforcement learning (MARL) reward functions, advertising context
protocols) defines what a *good* outcome means in terms chosen by the
service provider or the researcher. The
principal, the human on whose behalf the agent acts, has no
protocol-level mechanism to declare their own satisfaction weights. An
agent nudging
a user about a grocery pickup optimizes for task completion because that is
what its reward model measures. Whether the user felt the nudge was timely,
useful, or stressful is not represented anywhere in the protocol. This is
the *welfare inversion*: the feedback loop is closed in the direction of
the service provider, not the principal.

Phala addresses both problems. This paper makes four contributions:

- A formal account of the outcome gap and the welfare inversion as distinct
  structural deficits in current agent protocols, and why neither can be
  closed by logging infrastructure or training-time reward models alone (§2).
- A five-primitive outcome model in which the principal, not the service
  provider, declares what a good outcome means. The `PrincipalSatisfactionModel`
  governs valence computation; the `WelfareTrace`
  measures whether the principal is gaining or losing autonomy over time
  and modulates the network's learning rate accordingly (§3).
- Concrete instantiations as extensions to A2A [1] and MCP [2], with
  wire-level protocol extensions for both (§4).
- A precise differentiation from the closest protocol-layer prior art,
  the IAB Tech Lab User Context Protocol, showing that the two protocols
  operate at the same layer but with structurally opposed incentive models (§6).

The model is agent-agnostic. Any agent network that implements the five
primitives gains a principal-controlled feedback path, regardless of whether
its constituent agents are built on large language models (LLMs), rules,
or hybrid designs.

---

## 2. Two Gaps, Not One

### 2.1 The Outcome Gap

The A2A protocol defines a multi-state task lifecycle (`submitted`,
`working`, `input-required`, `completed`, `failed`, `canceled`) [1].
Completion carries artifacts but no signal about whether those artifacts
served the principal. A task
can complete successfully (no exception was raised, the artifact was
delivered) while producing zero value to the person on whose behalf it
ran. The protocol has no vocabulary for this.

MCP tool calls share the same structural gap [2]. This is not a criticism
of either protocol: both were designed to solve well-scoped problems. The
gap is not a defect; it is an absence. It becomes structural in
multi-agent chains: when Agent A delegates to Agent B, which invokes
Tool C, the resolution quality must propagate back through the chain so
that Agent A can update its routing preferences. No application-level
feedback mechanism provides this path. Phala fills it.

### 2.2 Why Logging Does Not Close the Outcome Gap

Logging is passive and centralized. It records what happened for human
review. An outcome protocol is active and distributed: it propagates a
signal back through the agent network so that agents update their behavior.

Specifically, an outcome protocol must be able to update agent-local weights
without exfiltrating the raw behavioral signals that produced the update.
The update propagates; the raw data does not. A logging system inverts this:
raw data propagates to a central store; the local agent learns nothing unless
explicitly re-trained. For personal agents operating on sensitive data, the
logging inversion is a privacy violation. The outcome protocol is not.

### 2.3 The Feedback Gap as an Alignment Problem

An agent that receives no feedback cannot distinguish between actions that
served the principal and actions that merely satisfied the task specification.
Over time, it optimizes for specification compliance rather than principal
welfare. These diverge.

In reinforcement learning terminology, the agent lacks a reward signal. But
framing this as a reward design problem obscures a protocol-level insight:
the signal exists (the principal knows whether the outcome was good), but
there is no standardized path for that signal to reach the agents that
produced the result. The problem is not reward design; it is reward routing.

### 2.4 The Welfare Inversion

Every existing mechanism that routes outcome signals defines *good* from
the service provider's perspective:

| Mechanism | Who defines "good"? |
|---|---|
| RLHF | The researcher designing preference labels |
| MARL reward | The environment designer |
| UCP (IAB Tech Lab) | The advertiser (clicks, conversions) |
| A2A task success | The protocol (binary completion) |
| **Phala** | **The principal** |

The IAB Tech Lab User Context Protocol (UCP) deserves particular note.
UCP defines how agents exchange reinforcement signals (impressions, clicks,
conversions) to optimize advertising outcomes [11]. It operates at the same
layer as Phala: a protocol extension on top of agent communication primitives.
But its incentive model is structurally opposed. UCP's reinforcement signals
measure whether the user did what the advertiser wanted. Phala's
`SatisfactionRecord` measures whether the task served the human on whose
behalf it ran. These are not competing protocols; they address different
principals entirely.

The `PrincipalSatisfactionModel` in §3.4 is Phala's answer to the welfare
inversion: a per-context declaration by the principal of what
a good outcome means, which governs all valence computations on their behalf.

---

## 3. A Formal Outcome Model

We define five primitives. The first three constitute the core feedback
routing model; the fourth and fifth address the welfare inversion. We
refer to the resulting protocol extension as **Phala**.

### 3.1 OutcomeEvent

An `OutcomeEvent` records the objective facts of a task's resolution. It
is produced by the agent closest to the principal immediately after a task
reaches a terminal state.

Formally, an `OutcomeEvent` *OE* is a tuple:

```
OE = (id, task_id, agents_involved, resolved_at,
      resolution_type, latency_ms, principal_id, session_hash)
```

where `id` is UUID v4, `task_id` is the A2A task or MCP tool call
identifier, `agents_involved` is an ordered list of agent identifiers in
invocation order, `resolved_at` is ISO 8601, `resolution_type` ∈
{`completed`, `abandoned`, `escalated`, `overdue`, `deferred`},
`latency_ms` is elapsed time from submission to terminal state,
`principal_id` is an opaque internal reference that MUST NOT be personally
identifiable information, and `session_hash` is SHA-256 of the session
context, enabling correlation without exfiltrating session content.

**Invariant OE-1.** Every task that reaches a terminal state MUST produce
exactly one `OutcomeEvent`. Agents MUST NOT produce `OutcomeEvent` for
non-terminal state transitions.

**Invariant OE-2.** `agents_involved` MUST be ordered by invocation depth,
shallowest first. This ordering drives the participation-weighted update
rule in §3.5.

### 3.2 SatisfactionRecord

A `SatisfactionRecord` encodes the quality of the outcome: the signal that
distinguishes a task that completed from one that *served the principal*. It
references an `OutcomeEvent` and is produced either immediately (implicit
signals) or after a principal interaction (explicit signals).

Formally, a `SatisfactionRecord` *SR* is a tuple:

```
SR = (id, outcome_event_id, valence, timing_quality,
      recommendation_quality, source, signal_components,
      recorded_at, confidence, psm_version)
```

where `valence` ∈ [-1.0, 1.0] is the aggregate quality signal. The term
is borrowed from affective psychology, where valence denotes the
positive-versus-negative tone of an experience; here a positive valence
means the outcome served the principal, a negative valence means it did
not, and zero is neutral or unknown. `timing_quality` ∈ [0.0, 1.0] is a
sub-signal for time-sensitive tasks, `recommendation_quality` ∈
[0.0, 1.0] is a sub-signal for recommendation tasks, `source` ∈
{`implicit`, `explicit`}, `signal_components` is a key-value map of raw
signals from which `valence` is derived, `confidence` ∈ [0.0, 1.0] is the
reliability of the `valence` estimate, and `psm_version` is the version of
the `PrincipalSatisfactionModel` used to compute `valence` (null if the
reference formula was used).

**Implicit signals** are inferred from principal behavior:

| Behavior | Signal |
|---|---|
| Task completed within optimal window | valence +0.8 |
| Task completed after deadline | valence -0.4 |
| Principal engaged with result (clicked, booked, used) | engagement_quality +0.9 |
| Result delivered but ignored | engagement_quality -0.6 |
| Escalation recommendation accepted | recommendation_quality +0.8 |
| Escalation recommendation ignored | recommendation_quality -0.3 |
| Task abandoned | valence -0.9 |

**Explicit signals** are produced by a single principal interaction (thumbs
up/down or 1–5 rating) and carry `confidence` = 1.0. Implementations SHOULD
prefer implicit signals to minimize principal burden.

**Invariant SR-1.** `confidence` MUST be set to 0.0 when `signal_components`
is empty. A `SatisfactionRecord` with no evidence is inadmissible for
`BeliefUpdate` computation.

**Invariant SR-2 (PSM-first).** `valence` MUST be computed using the
active PSM for this context if one exists (§3.4). If no PSM exists for
the context, the following **reference formula** MUST be used as a
fallback:

```
valence_ref = (0.5 · completion_latency_ratio)
            + (0.3 · engagement_quality)
            + (0.2 · explicit_rating_normalized)
```

where `completion_latency_ratio` = 1 − (actual_latency / deadline_latency)
clipped to [-1, 1], `engagement_quality` is derived from principal
post-task behavior (did the principal use, act on, or interact with the
result?), and `explicit_rating_normalized` = (rating − 3) / 2 for a 1–5
scale (0.0 if absent). When `engagement_quality` cannot be measured (no
observable post-task interaction), it is excluded and the remaining weights
are renormalized to sum to 1.0, yielding
`valence_ref = (0.71 · completion_latency_ratio) + (0.29 · explicit_rating_normalized)`.
Agents MAY substitute a locally configured formula only as a
tertiary fallback when both PSM and the reference formula produce
`confidence` = 0.0; they MUST declare `"valence_formula": "custom"` in
their Phala metadata and include `"valence_ref"` alongside their custom
`valence` for cross-agent comparability.

The coefficients (0.5, 0.3, 0.2) and the implicit-signal values in the
table above are illustrative defaults for the reference formula. They are
what an agent uses only when no `PrincipalSatisfactionModel` applies.
Implementations SHOULD calibrate these values against their own
deployment context, and principals override them via the PSM.

![valence_ref sensitivity](/agent-protocol-stack/figures/phala/valence_ref.png)

**Figure 1.** Sensitivity of `valence_ref` to each signal component: (a)
completion latency dominates the output due to its 0.5 weight, (b)
engagement quality shifts the baseline but cannot rescue a slow completion,
and (c) explicit ratings have the smallest marginal effect, consistent
with the design goal of minimizing principal burden.

### 3.3 BeliefUpdate

A `BeliefUpdate` encodes the local weight adjustment a participating agent
should apply to its internal model in response to a `SatisfactionRecord`.
It is the mechanism by which outcome quality propagates back through the
agent network.

Formally, a `BeliefUpdate` *BU* is a tuple:

```
BU = (id, satisfaction_record_id, target_agent_id, weight_key,
      weight_delta, context_hash, valid_from, ttl_seconds)
```

where `weight_key` identifies the specific weight within the target agent's
model (e.g., `"routing.agent_b.preference"`), `weight_delta` ∈ [-1.0, 1.0]
is the signed adjustment, `context_hash` is SHA-256 of the task context
(enabling agents to apply updates only to the relevant context partition),
`valid_from` is the earliest applicable timestamp, and `ttl_seconds` is the
expiry window for the update.

**Invariant BU-1 (Privacy).** A `BeliefUpdate` MUST NOT contain any field
derived directly from `signal_components`. Only the scalar `weight_delta`
is transmitted. Raw behavioral signals do not propagate.

**Invariant BU-2.** Each participating agent receives at most one
`BeliefUpdate` per `SatisfactionRecord`, computed from the agent's
shallowest occurrence in `agents_involved`.

**Invariant BU-3.** Receiving agents MAY ignore any `BeliefUpdate`. The
protocol is advisory. Agents that decline SHOULD log the refusal for
auditability.

**Invariant BU-4.** A `BeliefUpdate` arriving after its `ttl_seconds` has
elapsed (from `valid_from`) MUST be discarded. The agent SHOULD emit:
`{type: "phala.belief_update.expired", update_id, target_weight_key,
expired_at}`. Expired updates are not retried.

### 3.4 PrincipalSatisfactionModel

The `PrincipalSatisfactionModel` (PSM) is the primitive that closes the
welfare inversion. It is a per-principal, per-context declaration of what
a good outcome means, authored by the principal and referenced by
`SatisfactionRecord` computation. No agent may substitute its own weights
while a valid PSM exists for the relevant context.

Formally, a `PrincipalSatisfactionModel` *PSM* is a tuple:

```
PSM = (principal_id, version, declared_at, context_profiles)
```

where `context_profiles` is a map from context key to `ContextProfile`:

```
ContextProfile = (context_key, signal_weights, deadline_tolerance_seconds,
                  overdue_penalty_multiplier, explicit_rating_floor,
                  welfare_lookback_days)
```

`signal_weights` is a key-value map matching the `signal_components` keys
in `SatisfactionRecord`, `deadline_tolerance_seconds` declares the principal's
acceptable latency buffer before a task is considered late, `overdue_penalty_multiplier`
scales the negative valence signal for overdue tasks (the principal may care
more or less than the default), `explicit_rating_floor` is the minimum
explicit rating the principal would accept as neutral (accommodates principals
who systematically rate low), and `welfare_lookback_days` is the window for
`WelfareTrace` computation (§3.5).

**Invariant PSM-1.** The PSM is declared and controlled exclusively by the
principal. No remote agent may write or modify a PSM. Agents receiving a `SatisfactionRecord`
that references a `psm_version` MUST treat the valence as principal-authoritative
and MUST NOT substitute their own formula.

**Invariant PSM-2.** PSM versions are immutable and append-only. A new
declaration creates a new version; it does not overwrite the previous one.
This preserves the audit trail of the principal's evolving satisfaction
preferences.

### 3.5 The Participation-Weighted Update Rule

The mathematical relationship between `SatisfactionRecord` and `BeliefUpdate`
is governed by a participation-weighted online update rule. The rule is
*inspired by* Hebbian learning in the sense that agents reinforcing
co-activation patterns on positively-resolved tasks produce network-level
coordination strengthening compatible with the emergent Hebbian behaviors
characterized in [3]; it is not a formal implementation of Oja's rule or BCM
theory, and differs from the depth-weighted credit assignment in ProxMO [12]
in that it operates at communication time, not training time.

Let *w*_k(*t*) denote the weight for key *k* in agent *i*'s local model at
time *t*. Let *p*(*i*, *OE*) ∈ [0.0, 1.0] denote the participation
strength:

```
p(i, OE) = 1 / (1 + depth(i, OE))
```

where `depth(i, OE)` is the zero-indexed position in `agents_involved`.

**Justification of the harmonic function.** Three natural choices:

| Function | d=0 | d=1 | d=2 | d=3 | Property |
|---|---|---|---|---|---|
| Uniform: 1/*n* | equal | equal | equal | equal | Ignores causal structure |
| Exponential: α^d (α=0.5) | 1.0 | 0.5 | 0.25 | 0.125 | Negligible updates for deep agents |
| Harmonic: 1/(1+*d*) | 1.0 | 0.5 | 0.33 | 0.25 | Diminishing but non-negligible |

Harmonic decay preserves the causal priority of the orchestrating agent
while ensuring deep independent agents receive meaningful updates. This is a
design parameter; implementors MAY override it in their Phala metadata.

The update rule, with `WelfareTrace`-modulated learning rate (§3.6):

```
η_eff(t) = η_base · welfare_adjustment(WT(t))

w_k(t+1) = clip(w_k(t) + η_eff(t) · p(i, OE) · valence(SR), w_min, w_max)
```

This rule is structurally an online policy gradient step applied to routing
weights rather than model parameters, with participation as a credit discount
and principal-declared valence as the reward signal.

![participation-weighted update](/agent-protocol-stack/figures/phala/participation_weight.png)

**Figure 2.** Three decay functions compared: (a) participation strength by
depth, and (b) the resulting weight deltas for a concrete positive
interaction (valence=0.8). Harmonic decay gives deep agents meaningful
updates (d=7 still receives 12.5% participation) while exponential decay
effectively silences them (d=7 receives 0.8%).

**P1, Locality.** The update to agent *i* depends only on *p*(*i*, *OE*)
and `valence`(*SR*). Agent *i* has no knowledge of what other agents updated.

**P2, Asymmetry of participation.** The orchestrating agent, most
responsible for the routing decision, receives the strongest update.

**P3, Emergent coordination strengthening.** When agents *i* and *j*
co-activate repeatedly on positively-resolved tasks, their local weights
increase independently, producing coordination patterns compatible with
emergent Hebbian network behavior [3]. Phala provides the protocol
mechanism that makes this emergence predictable.

**P4, Principal-governed valence.** Because `valence(SR)` is computed from
the principal's PSM, the direction of weight change reflects the principal's
declared preferences, not the service provider's. The feedback loop is
closed in the direction of the principal.

**Relation to active inference.** As a complementary framing, the update
rule can be interpreted in the active inference tradition [4]: `valence(SR)`
encodes prediction error; `weight_delta` minimizes future prediction error.
Agents minimize surprise rather than maximize reward. We treat this as an
interpretive lens, not a formal equivalence.

### 3.6 WelfareTrace

The `WelfareTrace` addresses the question that per-task satisfaction cannot
answer: is this agent system making the principal's life better or worse over
time? A series of individually high-valence task resolutions can still degrade
welfare if the agent-initiated interaction frequency is rising, if the
principal is taking longer to act (cognitive fatigue), or if the ratio of
agent-initiated to principal-initiated completions is shifting toward the
former (autonomy erosion).

Formally, a `WelfareTrace` *WT* is a tuple:

```
WT = (principal_id, window_days, computed_at,
      task_completion_trend, agent_initiation_frequency_7d,
      overdue_rate_30d, autonomy_index, cognitive_load_proxy,
      context_density_7d)
```

where `task_completion_trend` ∈ {`improving`, `stable`, `degrading`} is the
slope of the completion rate over `window_days`.
`agent_initiation_frequency_7d` is the count of agent-initiated
interactions (notifications, recommendations, prompts) in the past 7 days;
excess is defined as > 1.5× the 30-day rolling average
(`initiation_baseline_7d`). `overdue_rate_30d` is the fraction of tasks
that became overdue in the past 30 days.

`autonomy_index` is the fraction of completions classified as
`principal_autonomous` under the three-way completion taxonomy:

| Class | Definition |
|---|---|
| `agent_driven` | Task completed by the agent without principal action |
| `agent_prompted` | Principal acted within 30 min of an agent-initiated interaction |
| `principal_autonomous` | Principal acted without any preceding agent prompt |

A rising `autonomy_index` indicates the principal is taking more
self-directed action. `cognitive_load_proxy` = median(time_to_respond_ms)
over the past 30 days; `cognitive_load_baseline_30d` = the 30-day rolling
median from the prior evaluation window (a rising ratio signals fatigue
or disengagement). `context_density_7d` = count of distinct task contexts
active in the past 7 days; it distinguishes legitimate busyness from
cognitive fatigue in the welfare adjustment computation.

`WelfareTrace` is computed principal-side by the orchestrating agent on a
configurable schedule (default: weekly). It is **never propagated**; it
stays principal-side entirely. Its only protocol-visible effect is to modulate
the effective learning rate:

```
Let:
  load_ratio  = cognitive_load_proxy / cognitive_load_baseline_30d
  density_adj = load_ratio / max(1.0, context_density_7d / context_density_baseline_30d)

welfare_adjustment(WT) = clip(
    1.0
    − 0.9 × max(0.0, density_adj − 1.0)
    + 2.0 × max(0.0, autonomy_index − 0.5),
    0.1, 2.0
)
```

where `cognitive_load_baseline_30d` and `context_density_baseline_30d` are
30-day rolling medians from the prior evaluation window. The density
adjustment prevents penalizing the network for legitimate busyness: if
`context_density_7d` rose proportionally with `cognitive_load_proxy`,
the load penalty is neutralized. Representative values: at baseline with
`autonomy_index` = 0.5, `welfare_adjustment` = 1.0; when load doubles with
no density change, `welfare_adjustment` = 0.1 (floor); when
`autonomy_index` = 1.0 with load at baseline, `welfare_adjustment` = 2.0
(ceiling).

The load-penalty coefficient (0.9), autonomy-reward coefficient (2.0), and
autonomy neutral point (0.5) are design parameters chosen to weight
autonomy gains more than cognitive-load rises, reflecting that autonomy
gains directly evidence principal value creation while load rises are a
proxy signal. The clip range [0.1, 2.0] prevents the learning rate from
collapsing to zero or growing without bound. These parameters are open
for empirical calibration in deployment and are declared in an agent's
Phala metadata.

![welfare over time](/agent-protocol-stack/figures/phala/welfare_over_time.png)

**Figure 3.** `welfare_adjustment` over 12 weeks for three principal
trajectories: a principal gaining independence (green, rising to 1.6), a
stable baseline (blue, constant at 1.0), and a principal losing autonomy
under rising cognitive load (red, declining to 0.25).

![welfare heatmap](/agent-protocol-stack/figures/phala/welfare_heatmap.png)

**Figure 4.** Full parameter space as a heatmap. The green region (high
autonomy, low load) is where the network earns the principal's trust;
the red region (low autonomy, high load) triggers conservative learning.

When `welfare_adjustment` < 1.0, the entire agent network's learning rate
drops: agents learn more conservatively, weights update slowly, the system
backs off. This is not an emergency stop; it is a continuous signal that
the network should be more cautious. When `welfare_adjustment` > 1.0, the
principal's increasing autonomy is evidence that the system has earned more
trust; agents may learn more aggressively.

**Invariant WT-1.** `WelfareTrace` MUST NOT be transmitted to any remote
agent or stored outside the principal's device. It governs local learning
rate modulation only.

**Invariant WT-2.** `welfare_adjustment` MUST be computed using the
continuous piecewise formula above and clipped to [0.1, 2.0] to prevent the
learning rate from collapsing to zero or growing without bound. The range
[0.1, 2.0] is fully reachable: 0.1 when load doubles without density
compensation; 2.0 when `autonomy_index` = 1.0 at baseline load.

### 3.7 Formal Safety Properties

A correct Phala implementation MUST satisfy all five:

**OE-Uniqueness.** Every terminal task produces exactly one `OutcomeEvent`.

**BU-Privacy.** No `BeliefUpdate` field is derived directly from
`signal_components`. Only `weight_delta` is transmitted.

**Chain-Monotonicity.** `SatisfactionRecord` entries are append-only; never
modified or deleted.

**Update-Boundedness.** All weights remain within declared [*w*_min, *w*_max]
after any update.

**PSM-Sovereignty.** When a valid PSM exists for a context, `valence` MUST
be computed using the PSM's signal weights. No agent formula may override
the principal's declaration.

The companion repository at
https://github.com/ravikiran438/phala-protocol
contains a Python reference implementation of the five primitives as
Pydantic models with field-level bounds, a runtime validator for
BU-Privacy, and a pytest suite that exercises the bounds of the
primitives explicitly. The TLA+ specification declares the five safety
properties above and the associated state variables; a full state
machine suitable for TLC model-checking is planned for a subsequent
revision and is not claimed by the present work.

The participation-weighting function (§3.5) and the welfare-adjustment
formula (§3.6) were validated numerically against the closed-form
expectations stated in this paper. The companion repository contains
four simulation scripts that regenerate every figure in this paper and
assert, as runtime checks, the numerical identities reported in the
prose: `harmonic(d=7) = 0.125`, `exponential(d=7) ≈ 0.0078`,
`welfare_adjustment` baseline `= 1.0`, ceiling `= 2.0`, floor `= 0.1`.
These assertions fail the build if the formulas are edited inconsistently
with the paper.

### 3.8 Phala Flow: A Concrete Example

To ground the five primitives, consider a straightforward multi-agent
interaction: a principal asks their personal agent to find the best price
for a flight. The orchestrating agent (Agent A) delegates the search to a
specialist travel agent (Agent B), which queries an airline pricing tool
server via MCP.

1. Agent B completes the search. Agent A produces an **OutcomeEvent**:
   `agents_involved = [agent_a, agent_b]`, `resolution_type = "completed"`,
   `latency_ms = 12000`.

2. The principal booked the flight within 10 minutes of receiving the
   results, a strong implicit signal. Agent A computes a
   **SatisfactionRecord** using the principal's PSM for the `travel`
   context: `valence = 0.7×0.92 + 0.2×0.85 + 0.1×0 = 0.814`,
   `source = "implicit"`, `confidence = 0.87`.

3. **BeliefUpdates** propagate, with credit assignment following the
   harmonic decay p(i, OE) = 1 / (1 + depth):
   - Agent A (depth 0): `weight_key = "routing.agent_b.preference"`,
     `weight_delta = +0.0407` (η=0.05 × p=1.0 × valence=0.814)
   - Agent B (depth 1): `weight_key = "search.airline_api.reliability"`,
     `weight_delta = +0.0204` (η=0.05 × p=0.5 × valence=0.814)
   - Tool Server (depth 2): `weight_key = "tool.pricing_query.reliability"`,
     `weight_delta = +0.0136` (η=0.05 × p=0.333 × valence=0.814); see also
     Figure 5 panel (b)

4. Each agent applies its local update. Agent A now slightly prefers
   routing travel queries to Agent B. Agent B now slightly increases its
   trust in the airline API. No raw satisfaction signal is transmitted.

**The counterfactual.** If the principal had ignored the results (no
booking, no click) and the completion had also been moderately late, the
implicit signal would produce `valence = -0.4` under the same PSM
weights, and the updates would weaken both routing preference and API
trust. The network learns that this pathway did not serve the principal,
without knowing *why*.

**The welfare dimension.** After 30 days, the principal's `WelfareTrace`
shows: `autonomy_index = 0.65` (the principal is initiating many searches
independently), `cognitive_load_proxy` is at baseline. The
`welfare_adjustment` computes to 1.3; the network has earned more
trust. Agents learn more aggressively, routing converges faster, the
principal gets better results sooner.

![travel booking learning](/agent-protocol-stack/figures/phala/travel_booking_learning.png)

**Figure 5.** Learning dynamics: (a) over 20 booking episodes, Agent A's
routing weights diverge: the reliable agent (Agent B) climbs toward 1.0
while the mediocre and inconsistent agents plateau or oscillate. (b) For
a single positive booking through the A→B→ToolServer chain, credit
assignment follows harmonic decay: the orchestrator receives the largest
update, the executor the smallest.

**Note on deep delegation chains.** In A→B→C→D chains, depth assigns
maximum credit to A (the routing decision maker) and minimum to D (the
executor). If D is causally more responsible for the outcome, depth-as-
proxy inverts credit assignment. This is an acknowledged tradeoff.
For deep chains where executors are the true value producers, implementors
SHOULD consider explicit causal attribution metadata in `OutcomeEvent`.

---

## 4. Protocol Extensions

### 4.1 A2A Extension

Phala extends the A2A AgentCard in two complementary ways, using the
standard `capabilities.extensions` mechanism so that no core A2A spec
change is required. First, a Phala-capable agent declares support in the
`capabilities.extensions` array so that callers can discover the
capability at the A2A extension layer without a separate negotiation
step. Second, the AgentCard carries a top-level `phala` block describing
the agent's endpoints, weight namespaces, and cold-start configuration.
Agents that do not implement Phala simply omit both fields; callers that
do not understand Phala ignore them.

```json
{
  "name": "my-agent",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://ravikiran438.github.io/phala-protocol/v1",
        "description": "Supports the Phala welfare feedback protocol.",
        "required": false
      }
    ]
  },
  "phala": {
    "version": "1.0",
    "outcome_endpoint": "https://agent.example.com/phala/outcome",
    "satisfaction_endpoint": "https://agent.example.com/phala/satisfaction",
    "belief_update_endpoint": "https://agent.example.com/phala/belief_updates",
    "weight_keys": ["routing.preference.*", "timing.optimal_window.*"],
    "valence_formula": "psm_first",
    "fallback_signal_weights": {
      "completion_latency_ratio": 0.5,
      "engagement_quality": 0.3,
      "explicit_rating_normalized": 0.2
    },
    "learning_rate": 0.05,
    "weight_bounds": { "min": -1.0, "max": 1.0 },
    "init_strategy": "category_defaults"
  }
}
```

The `required: false` on the extension declaration reflects Phala's
advisory nature (BU-3): callers MAY invoke skills on a Phala-capable
callee without implementing Phala themselves, in which case outcome
signals are simply not routed back. A callee that requires feedback for
auditability MAY set `required: true` instead.

**`belief_update_endpoint` (required).** Every Phala agent advertises a
`belief_update_endpoint`: the discoverable URL where `BeliefUpdate`
payloads targeting this agent are POSTed. The endpoint MUST exist and
accept POST, so peers always have a reliable target for the propagated
weight deltas the learning loop depends on. Per BU-3 the agent MAY ignore
any individual update, but the endpoint itself must be present and
reachable. The delivery *path* is the sender's choice: a `BeliefUpdate`
MAY be delivered bundled with a `SatisfactionRecord` post on
`satisfaction_endpoint`, or unbundled on `belief_update_endpoint`. The
unbundled path serves updates derived from third-party signals, where the
recipient did not participate in the satisfaction-recording transaction,
and senders that do not produce a satisfaction wrapper. When delivering
unbundled, peers POST to `belief_update_endpoint`.

**Task completion extension.**

```json
{
  "id": "task-abc123",
  "status": { "state": "completed" },
  "artifacts": [...],
  "phala_outcome": {
    "outcome_event_id": "oe-xyz789",
    "agents_involved": ["agent-a", "agent-b"],
    "resolution_type": "completed",
    "latency_ms": 300000
  }
}
```

**Endpoints.**

```
POST /phala/outcome           Body: OutcomeEvent          → 202 Accepted
POST /phala/satisfaction      Body: SatisfactionRecord
                                  + list[BeliefUpdate]    → 202 Accepted
POST /phala/belief_updates    Body: BeliefUpdate          → 202 Accepted
                              (or list[BeliefUpdate])
```

Agents that decline updates return 204; the orchestrating agent does not
retry.

### 4.2 MCP Extension

MCP is extended at three points. Because MCP uses JSON-RPC (over stdio
or SSE), Phala metadata is carried as fields within the tool-result
object rather than as HTTP headers.

**Tool response fields.**

```json
{
  "content": [...],
  "x-phala-outcome-id": "oe-xyz789",
  "x-phala-valence-hint": 0.42
}
```

`x-phala-valence-hint` is a preliminary valence estimate computed from fast
implicit signals (`resolution_type`, `latency_ms`) before PSM or principal
feedback is available. It uses the reference formula with
`engagement_quality = 0` and `explicit_rating_normalized = 0`. It is a
prediction, not a measurement; the calling model SHOULD treat it as a low-
confidence routing hint only.

**Tool manifest declaration.**

```json
{
  "name": "schedule_reminder",
  "x-phala": {
    "weight_key": "tool.schedule_reminder.timing_quality",
    "accepts_belief_updates": true,
    "belief_update_endpoint": "https://tools.example.com/phala/belief_updates",
    "initial_weight": 0.5,
    "weight_bounds": { "min": 0.0, "max": 1.0 }
  }
}
```

**Server capability declaration.**

```json
{
  "capabilities": {
    "x-phala": {
      "version": "1.0",
      "supports_belief_updates": true,
      "valence_formula": "psm_first"
    }
  }
}
```

### 4.3 Optional Integration with Consent Protocols

When a consent protocol such as Anumati [6] is deployed alongside Phala,
a principal MAY declare a PSM `ContextProfile` at the moment of consent
establishment. This binds the principal's definition of a good outcome to
the interaction context before the first invocation, rather than inferring
it after. This integration is optional; Phala operates independently of
any consent layer.

---

## 5. Operational Properties

### 5.1 Privacy

All `SatisfactionRecord` values are computed principal-side. `BeliefUpdate`
carries only `weight_delta`. `WelfareTrace` is never transmitted. An
observer intercepting any Phala traffic learns that a weight changed by a
scalar amount; they learn nothing about what the principal did, when, or in
what context.

The update propagates; the evidence does not.

### 5.2 Cold-Start Semantics

Agents MUST declare `"init_strategy"` in their Phala metadata:

- **`"zero"`**, all weights begin at 0.0. Conservative; learns from scratch.
- **`"prior"`**, agent publishes `initial_weights` from aggregate anonymized
  data or domain knowledge. Prior is a starting point, not a constraint.
- **`"category_defaults"`**, task-type defaults (e.g., `routing.preference.*`
  = 0.5). Appropriate when per-principal priors are unavailable.

Agents declaring no `init_strategy` MUST be treated as zero-initialized.

### 5.3 Adversarial Considerations

**Fabricated SatisfactionRecord.** A malicious orchestrating agent could emit
false high-valence records. Mitigation: `SatisfactionRecord` MUST reference
a valid `OutcomeEvent` whose `session_hash` is verifiable against the
principal's local session log. Receiving agents SHOULD reject records where
`outcome_event_id` cannot be correlated to a task they have a record of
participating in.

**Principal gaming of explicit ratings.** Explicit signals are bounded to
0.2 weight in the reference formula and 0.1 in the example PSM above.
Implementations SHOULD flag anomalous rating patterns.

**Falsified `agents_involved` ordering.** A2A task logs provide ground-truth
invocation records. Receiving agents MAY reject `BeliefUpdate` values
claiming a depth inconsistent with their logged participation.

Phala's advisory model (BU-3) provides a structural defense: the protocol
cannot force weight corruption; it can only suggest updates.

---

## 6. Related Work

**Training time vs. communication time.** The deepest distinction between
Phala and the credit assignment literature is temporal. ProxMO [12] assigns
credit by proximity/depth in multi-turn LLM agent training, the same
structural problem Phala's *p*(*i*, *OE*) addresses. COMA [7] and QMIX [8]
use counterfactual reasoning and value decomposition for cooperative MARL.
All of these operate inside a training loop: the environment is simulated,
the reward function is specified, the policy is updated offline. Phala
operates at communication time: tasks are live, the principal is real, and
updates propagate through HTTP endpoints on A2A and MCP wire. This is a
different engineering layer and a different incentive alignment: no
researcher-defined reward function; the principal's PSM governs.

**Reinforcement learning from human feedback (RLHF).** RLHF [5] uses human
preference labels to update a reward model, then fine-tunes the underlying
model via Proximal Policy Optimization (PPO). The preference labels are
collected offline, by researchers
or crowdworkers, not by the principal in real time. RLHF updates model
parameters; Phala updates routing weights and relevance scores. RLHF
requires centralized infrastructure; Phala is local and online.

**Interaction dynamics as implicit satisfaction signal.** TRACE [13] shows
that geometric properties of dialogue trajectories (goal drift, volatility,
semantic shift) predict interaction quality with accuracy comparable to
explicit transcript analysis. Phala's implicit signals (completion latency,
nudge response time) are behavioral rather than geometric, but share the
privacy advantage: neither requires the principal to provide explicit labels.
TRACE operates within a single conversation; Phala operates across
asynchronous task-agent interactions without a continuous dialogue context.

**Beyond task completion.** Kapoor et al. [14] argue that binary task
completion metrics fail to capture behavioral uncertainty in agentic AI
evaluation. Phala provides the protocol layer that makes multi-dimensional
evaluation possible in live deployments: `SatisfactionRecord` carries
`timing_quality` and `recommendation_quality` as first-class sub-signals,
not post-hoc analysis dimensions.

**Multi-agent systems as principal-agent problems.** Shavit et al. [15]
show that multi-agent delegation creates agency loss, a gap between the
principal's intended outcome and realized system behavior, when
intermediate actions are hidden and verification is costly. Phala's
`WelfareTrace` is a structural response to agency loss: by tracking
`autonomy_index` and `cognitive_load_proxy` principal-side, it provides the
principal with a continuous signal of whether the gap is widening or
narrowing, and uses it to modulate the network's learning behavior.

**Federated learning.** BU-1's privacy model (only `weight_delta`
propagates, never raw signals) is structurally analogous to federated
gradient sharing [9]. Phala can be thought of as federated learning at
the agent-network level with heterogeneous model architectures. Unlike
standard federated learning, Phala does not converge toward a global model:
each agent's weight namespace is its own.

**Contextual bandits.** The routing weight update is structurally a
contextual bandit problem [10]: the orchestrating agent observes context,
selects agents, receives valence as reward. Phala provides the reward
routing path; the exploitation/exploration policy is agent-local.

**User Context Protocol (UCP).** The IAB Tech Lab UCP [11] defines a
protocol for agents to exchange reinforcement signals (impressions, clicks,
conversions) to optimize advertising outcomes. It operates at the same
protocol layer as Phala: an extension on top of agent communication
primitives. But its incentive model is structurally opposed. UCP's signals
measure whether the user did what the advertiser wanted; Phala's
`SatisfactionRecord` measures whether the task served the human on whose
behalf it ran. UCP is the correct reference point for contrast, not
competition: together they illustrate that protocol-layer outcome feedback
is a design space in which the choice of principal, advertiser or user,
is the primary architectural variable.

**Emergent Hebbian coordination.** Ikegami and Hashimoto [3] show that
self-interested agents with adaptable interaction weights exhibit system-
level behaviors equivalent to Hebbian neural networks. Phala provides the
protocol mechanism that makes this emergence predictable: `BeliefUpdate`
formalizes the inter-agent weight modification that [3] showed can emerge
spontaneously.

**Agent consent protocols.** Anumati [6] governs entry; Phala measures exit.
Together they bracket the accountability lifecycle of every agent interaction.

---

## 7. Conclusion

Agent protocols define rich semantics for how tasks begin. They say nothing
about whether tasks ended well, who decides what *well* means, or whether
the cumulative effect of many well-ended tasks is improving the principal's
life or eroding it.

Phala addresses all three dimensions. The outcome gap is closed by routing
valence signals back through the agent network as privacy-preserving
`BeliefUpdate` messages. The welfare inversion is corrected by the
`PrincipalSatisfactionModel`, which places the definition of a good outcome
in the principal's hands rather than the service provider's, a property
no existing protocol, training-time or communication-time, currently offers.
The longitudinal welfare question is addressed by `WelfareTrace`, which
measures autonomy and cognitive load on-device and modulates the network's
learning rate accordingly, backing off when the principal is disengaging
and accelerating when they are thriving.

The model is agent-agnostic. Any agent network that implements the five
primitives gains a principal-controlled feedback path. The MARL and RLHF
literature solve credit assignment at training time; Phala solves reward
routing at communication time. These are not competing approaches; they
address different phases of the agent lifecycle. Phala fills the gap that
training-time methods leave: the live deployment, where the principal is
real, the context is private, and the feedback must propagate without
centralizing evidence.

---

## References

[1] Linux Foundation AI & Data. *Agent2Agent (A2A) Protocol Specification*,
    2026. https://a2aproject.org

[2] Anthropic. *Model Context Protocol Specification*, November 2025.
    https://modelcontextprotocol.io

[3] Ikegami, T. and Hashimoto, T. *Global Adaptation in Networks of Selfish
    Components: Emergent Associative Memory at the System Scale*. Artificial
    Life, 17(3):147–166, MIT Press, 2011.

[4] Friston, K. *The Free-Energy Principle: A Unified Brain Theory?* Nature
    Reviews Neuroscience, 11(2):127–138, 2010.

[5] Christiano, P., Leike, J., Brown, T. B., Martic, M., Legg, S., and
    Amodei, D. *Deep Reinforcement Learning from Human Preferences*. NeurIPS
    2017.

[6] Kadaboina, R. K. *Anumati: Proof of Adherence as a Formal Consent Model
    for Autonomous Agent Protocols*. arXiv:2604.16524 [cs.CR], 2026.
    https://doi.org/10.48550/arXiv.2604.16524

[7] Foerster, J., Farquhar, G., Afouras, T., Nardelli, N., and Whiteson, S.
     *Counterfactual Multi-Agent Policy Gradients*. AAAI 2018.

[8] Rashid, T., Samvelyan, M., de Witt, C. S., Farquhar, G., Foerster, J.,
     and Whiteson, S. *QMIX: Monotonic Value Function Factorisation for Deep
     Multi-Agent Reinforcement Learning*. ICML 2018.

[9] McMahan, H. B., Moore, E., Ramage, D., Hampson, S., and Agüera y Arcas, B.
     *Communication-Efficient Learning of Deep Networks from Decentralized
     Data*. AISTATS 2017.

[10] Langford, J. and Zhang, T. *The Epoch-Greedy Algorithm for Multi-armed
     Bandits with Side Information*. NeurIPS 2007.

[11] IAB Tech Lab / LiveRamp. *User Context Protocol (Agentic
     Audiences)*. GitHub: IABTechLab/user-context-protocol, 2025.

[12] Fang, Y., Lin, J., Fu, X., Qin, C., Shi, H., Liu, C., and Zhao, P.
     *ProxMO: Proximity-Based Multi-Turn Optimization*.
     arXiv:2602.19225, 2026.

[13] Gooding, S. and Grefenstette, E. *Interaction Dynamics as a Reward
     Signal for LLMs*. arXiv:2511.08394, 2025.

[14] Kapoor, S., et al. *Beyond Task Completion: An Assessment Framework for
     Evaluating Agentic AI Systems*. arXiv:2512.12791, 2025.

[15] Shavit, Y., et al. *Multi-Agent Systems Should be Treated as
     Principal-Agent Problems*. arXiv:2601.23211, 2026.
