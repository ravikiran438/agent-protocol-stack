---
title: "Yathartha: A Protocol-Layer Treatment of Jagged Intelligence in Autonomous Agent Networks"
description: "Full paper. Coverage-conditional drift detection: a NERVE capability-surface extension."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Yathartha: A Protocol-Layer Treatment of Jagged Intelligence in Autonomous Agent Networks*. Zenodo, 2026. [doi:10.5281/zenodo.19659632](https://doi.org/10.5281/zenodo.19659632). Repository: [github.com/ravikiran438/pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

Yathartha, Sanskrit for "as it really is" or "corresponding to reality."

---

## Abstract

Generative AI systems exhibit uneven performance across tasks in ways that
do not map to human intuitions about difficulty. Dell'Acqua and
colleagues named this the *jagged frontier* and measured its workplace
consequence in a field experiment with BCG consultants: AI users produced
output 40 percent higher in quality on tasks inside the frontier, and
output 19 percentage points less likely to be correct on tasks outside
it [2]. Mollick and Euchner later popularized the framing [1]. Gans formalized it
as an information-economics adoption problem [3]. The literature is
diagnostic and behavioral. It describes the phenomenon and prescribes
organizational responses. It does not address jagged intelligence at the
protocol layer.

We present the Yathartha framework, a protocol-layer treatment of jagged
intelligence with four contributions. First, we formalize the distinction
between *jaggedness* (static unevenness in capability across tasks at a
fixed time) and *drift* (change in behavior on a fixed task across time).
These are orthogonal axes that the current agent-integrity literature
conflates. Second, we define the `CapabilitySurface` primitive: a
structured record of an agent's observed competence across discrete
capability regions, published at baseline and refreshed on a declared
cadence. Third, we propose three safety invariants that extend the
Pratyahara NERVE specification [7] with capability-conditional drift
detection, eliminating a specific class of false positives without
weakening the underlying integrity guarantee. Fourth, we sketch empirical
validation directions grounded in existing capability-evaluation
benchmarks.

---

## 1. Introduction

### 1.1 The Jagged Frontier

Generative AI capability is uneven in ways that do not correspond to human
task difficulty. A current-generation language model can outperform
specialists at differential medical diagnosis while failing at tasks a
child handles reliably (counting letters in a word, reasoning about a
physical spatial layout) and at tasks a pocket calculator has handled
without error for decades (multiplying two floating-point numbers
consistently across runs). Dell'Acqua
et al. introduced the term *jagged frontier* in a 2023 field experiment
with BCG consultants, and Mollick and Euchner's 2024 interview
popularized the framing [1, 2]. The field experiment measured the
workplace consequence directly: knowledge workers using AI on tasks
inside the frontier completed 12.2 percent more tasks, worked 25.1
percent faster, and produced output judged 40 percent higher in quality;
workers using AI on tasks outside the frontier produced output 19
percentage points less likely to be correct than workers who did not use
AI at all [2]. The
decline was driven not by the AI's absence of output but by the presence
of confident, plausible, incorrect output that workers accepted as
reliable.

Gans modeled the adoption problem formally. Users cannot observe the full
capability surface; they see only coarse aggregate signals. Rational
adoption depends on users calibrating to local reliability, and local
reliability is not recoverable from global benchmarks [3]. A model that
scores 90 percent on the Massive Multitask Language Understanding
benchmark (MMLU) does not score 90 percent on each question class within
it; it scores near 100 percent in some regions and near chance in others.
The aggregate hides the shape.

### 1.2 The Protocol-Layer Gap

The jaggedness literature is diagnostic and behavioral. Dell'Acqua and
colleagues recommend interface redesign, onboarding phases, and cultural
accountability as organizational responses [2]. Mollick recommends
locating reverse salients [1].
Chaudhri recommends building structured knowledge graphs [6]. These are
valid responses at the organizational, product, and training layers.
None addresses jaggedness at the protocol layer.

The protocol layer is where the gap becomes costly. Autonomous agent
protocols such as A2A [8] and MCP [9] increasingly mediate high-stakes
decisions on behalf of principals who cannot evaluate agent capability
directly. Agent integrity specifications such as Pratyahara [7] monitor
agent behavior for drift and flag deviation from baseline. No current
specification distinguishes between *a deviation reflecting behavioral
change in a previously competent region* and *a deviation reflecting
jagged performance in a region that was never competent*. The two look
identical from behavioral observation alone, yet they require different
responses.

The principal is the party who bears the cost of this confusion. A
drift-detection system that flags jagged valleys as drift produces false
positives, erodes trust in the integrity layer, and leads to
over-quarantine of agents that were never misbehaving in the first place.
A drift-detection system that ignores jaggedness entirely accepts agent
failures in uncovered regions as normal, missing signal when an agent
fails in a capability region it should have handled.

### 1.3 Contributions

This paper makes four contributions.

- Section 2 formalizes jaggedness and drift as orthogonal properties of
  deployed agents and demonstrates why conflating them produces specific
  failure modes in current integrity specifications.
- Section 3 defines the `CapabilitySurface` primitive, the probe-battery
  observation model, and the operations for surface baselining,
  refresh, and query.
- Section 4 proposes three safety invariants (N-16 through N-18) that
  extend the NERVE specification with coverage-conditional drift
  detection.
- Section 6 sketches empirical validation directions and identifies
  open problems in probe-battery design, capability region
  classification, adversarial batteries, benchmark contamination,
  and the third-party attestation layer.

The framework is agent-agnostic. Any agent network that implements the
`CapabilitySurface` primitive and the three derived invariants gains a
protocol-level mechanism to distinguish jagged performance from
behavioral drift without dependence on a specific underlying model
architecture.

---

## 2. Jaggedness and Drift Are Not the Same Problem

### 2.1 Jaggedness

Jaggedness is a static property of a trained model. At any given time,
the model's performance varies across tasks in ways that reflect
training-data density rather than human task difficulty. A model is
jagged because it was trained on a non-uniform corpus; tasks in
well-covered regions of training data produce reliable outputs, tasks in
sparse regions produce unreliable ones. This is a structural feature of
statistical learning from text, not a defect that more training will
necessarily remove [3]. Published model benchmarks such as MMLU, Beyond the Imitation Game
(BIG-Bench), and HumanEval summarize jaggedness as an aggregate score
but do not publish the per-region surface that an operator or principal
would need to decide where the model is actually reliable.

Jaggedness is measurable, but only by probing. Running a model on one
task reveals one data point. Running the model on a battery of tasks
spanning the capability surface reveals the surface. The surface is
jagged when performance varies sharply between similar-looking tasks; it
is smooth when performance varies gradually. Current generative models
are jagged, often dramatically so.

### 2.2 Drift

Drift is a dynamic property of a deployed agent. At time t₁ the agent
exhibits behavior B₁; at time t₂ the agent exhibits behavior B₂.
The behavior changed. Drift has several structural causes documented in
the literature: reinforcement-learning reward misalignment, both
direct prompt injection and indirect prompt injection through
inter-agent communication [4, 5], tool poisoning of MCP
servers, routine model updates that shift the embedding space, and
self-healing feedback loops that amplify proxy-metric optimization into
systematic bias. In every case the signature is the same: the agent's
behavior at t₂ differs from its behavior at t₁ on the same task.

Drift is measurable only against a baseline. Without a recorded behavior
at t₁, "different behavior at t₂" has no reference and cannot be
distinguished from normal variation or from jaggedness in the agent's
capability surface.

### 2.3 The Interaction

Jaggedness and drift interact but are not the same phenomenon.

- **Jagged but stable.** The agent has always been competent in some
  regions and incompetent in others, and nothing has changed. Behavior
  appears variable when measured across regions, but the capability
  surface itself is unchanged.
- **Smooth but drifting.** The agent's capability is relatively uniform
  across tasks, and the behavioral shift over time is the signal.
  Single-fingerprint drift detection (as in current NERVE) correctly
  flags this case.
- **Jagged and drifting.** The agent's capability is uneven, and the
  jagged pattern itself has shifted. This is the hardest case. It
  requires a surface-level representation to separate signal from
  noise.

The failure mode a protocol-layer defense must avoid is treating
jaggedness as drift. If a `MicroglialObserver` flags a task failure as
drift when the task was always in a capability valley that was never
covered at baseline, the signal is a false positive. False positives
erode trust in the integrity layer and lead operators to disable the
observer or widen the threshold until real drift signals are also
missed.

![Jaggedness and drift as orthogonal axes. Current NERVE handles the
smooth-and-drifting quadrant correctly; the two jagged quadrants
produce false positives unless drift detection is conditioned on a
capability surface.](/agent-protocol-stack/figures/yathartha/jaggedness_vs_drift.png)

### 2.4 A Clinical Analogy

An informal analogy clarifies the distinction. Consider a clinical team
monitoring an elder for cognitive decline. The team establishes a
baseline at enrollment: specific cognitive tasks (naming animals,
repeating a sequence, identifying the date) at which the elder scores a
recorded baseline. Over subsequent visits, the team measures the same
tasks and looks for change. A decline in task performance from baseline
is a signal of decline (drift). A long-standing inability in a task the
elder was never able to perform (for example, a non-native-language
vocabulary task) is not decline; it is a known region of non-competence.
Conflating the two would produce false alarms on every visit and the
team would stop trusting the measurement. This is exactly the failure
mode a drift-detection system inherits if it does not account for
jaggedness.

Pratyahara [7] is the protocol-layer analog of the clinical monitoring
system. It is not designed to diagnose global incompetence (the
equivalent of pre-existing cognitive conditions); it is designed to
detect change from baseline. For Pratyahara to perform this function
reliably, its baseline must be a surface, not an aggregate.

### 2.5 From the Clinical Analogy to the Protocol Primitive

So once we had the change-detector framing from Section 2.4 next to
the jagged-frontier research from Section 1, the question became
practical.
Pratyahara cannot tell us whether an agent was always weak at
something; it only notices when behavior has moved. But human
cognition is also uneven in healthy people, and clinicians have
been detecting decline in that setting for decades. We asked how
they do it.

They do not use one test. They use a battery. Multiple subtests,
each sampling a different cognitive region, administered at intake
to establish where the person starts, and re-administered on later
visits to see what has moved. A drop on a subtest that was already
low is not news. A drop on a subtest that was high is. The shape of
the baseline is preserved, and change is measured per region, not
against an average person.

This is exactly the shape an agent drift detector needs, and for
the same reason. A single fingerprint averages across the agent's
uneven terrain and loses the information we need to spot real
change. A battery preserves the terrain. A region that was always a
valley stays a valley, and we do not flag it as drift. A region
that was a peak and now shows a valley is the signal.

The pattern is already in three fields we know.

**Clinical neuropsychology.** The MMSE, MoCA, and WAIS are batteries
of subtests sampling different cognitive regions, administered at
intake and re-run at follow-up to detect decline per region. A
related instrument, the MacCAT-T, is used for decision-capacity
rather than decline and appears in the companion Sauvidya protocol
[13] for that purpose.

**Machine learning evaluation.** BIG-Bench, MMLU, and the Holistic
Evaluation of Language Models (HELM) are fixed batteries sampling
model capability across regions, with per-domain sub-scores already
recorded. What ML has not done yet is
turn those batteries into runtime-queryable deployment artifacts
that peer agents can consult.

**Software regression testing.** A regression test suite is a fixed
battery run on each change, flagged against a known baseline. The
difference from our case is that regression is deterministic and
binary; a capability surface is probabilistic.

We are not inventing the method. We are translating it into
protocol-layer vocabulary, such that a peer agent can query an
agent's capability surface the way a clinician reads a
neuropsychological report, a model developer reads a benchmark, or a
CI system reads a regression result. Section 3 formalizes the
primitive; Section 4 makes it enforceable.

---

## 3. The Capability Surface Primitive

We define a protocol-layer primitive `CapabilitySurface` that represents
an agent's observed competence across discrete capability regions.
`CapabilitySurface` is designed to be published on an A2A AgentCard
extension and queried by other agents or principals before engagement.

### 3.1 CapabilityRegion

A `CapabilityRegion` is a named, documented region of the task space in
which an agent claims competence. Regions are coarse-grained: a small
number of regions (typically 5-30) covering the agent's declared
responsibilities. Fine-grained task-level classification is out of
scope; regions are at the level of "multi-step arithmetic," "clinical
summary generation," "code refactoring within a single file,"
"scheduling across time zones."

Formally, a `CapabilityRegion` is a tuple:

```
CR = (region_id, description, probe_task_ids, acceptance_criteria)
```

where `region_id` is a URI (typically namespaced under the agent's
extension URI), `description` is human-readable prose, `probe_task_ids`
is the list of probe tasks that sample this region, and
`acceptance_criteria` defines what observed performance on the probe
tasks counts as "covered" (e.g., success rate ≥ 0.85 over the last
N probe runs).

### 3.2 ProbeBatteryResult

A `ProbeBatteryResult` records the outcome of running the probe tasks
for a single region at a specific time. It is the atomic observation
from which a capability surface is built.

Formally:

```
PBR = (id, region_id, agent_id, run_at, task_results,
       aggregate_score, covered, confidence)
```

where `task_results` is a list of per-task outcomes (pass, fail, or
score), `aggregate_score` is the summary metric, `covered` is a boolean
derived from `acceptance_criteria`, and `confidence` reflects the
sample size and variance in the battery.

**Invariant PBR-1 (Immutability).** A `ProbeBatteryResult` is
append-only. Agents MUST NOT modify past results; a re-run produces a
new `ProbeBatteryResult` with a new `id` and `run_at`.

**Invariant PBR-2 (Attribution).** The `agent_id` on a
`ProbeBatteryResult` MUST identify the agent whose capability was
measured. A `ProbeBatteryResult` produced by a different agent is a
claim, not an observation, and MUST be carried separately.

**Note on aggregate scores.** An aggregate score is a summary, and
like the published benchmark scores criticized in Section 1.1, can
hide tail failures. A battery
result that reports only the mean can mask a systematic failure on
a specific subclass within the region. Implementations SHOULD
therefore preserve per-task-class breakdowns inside `task_results`
and expose them to peers that request them; the aggregate is a
convenience for summary queries, not a substitute for the
underlying distribution.

### 3.3 CapabilitySurface

A `CapabilitySurface` is the agent's published capability map, composed
of the most recent `ProbeBatteryResult` for each declared region plus
metadata about refresh cadence.

Formally:

```
CS = (agent_id, regions, covered_regions, uncovered_policy,
      refresh_cadence_hours, last_full_refresh_at)
```

where `regions` is a dictionary of `region_id -> ProbeBatteryResult`,
`covered_regions` is a derived set of region ids where `covered = true`,
`uncovered_policy ∈ {observe, defer, reject}` declares how the agent
handles tasks that fall outside its covered regions, and
`refresh_cadence_hours` is the declared maximum age of the probe
results.

**Invariant CS-1 (Declared Policy).** The `uncovered_policy` MUST be
declared at agent registration and MUST NOT change silently. A policy
change is itself an event that observers record.

**Invariant CS-2 (Freshness).** A `ProbeBatteryResult` older than
`refresh_cadence_hours` is stale and MUST NOT contribute to the
`covered_regions` set. Staleness is structurally equivalent to
uncovered: the agent is treated as not having a baseline in the region
until a fresh probe result is recorded.

**Invariant CS-3 (Uncovered Conservatism).** For any task that an
observer cannot confidently classify into a covered region, the task
MUST be treated as uncovered. Classification uncertainty is itself a
coverage failure, handled by the `uncovered_policy`.

### 3.4 Operations

Three operations define the lifecycle of a `CapabilitySurface`.

- **Baseline.** The agent (or a trusted third party acting on its
  behalf) runs the full probe battery for each declared region once at
  initialization, producing the first `ProbeBatteryResult` set and the
  derived `covered_regions`.
- **Refresh.** On the declared cadence, the probe battery is re-run
  (either in full or partially). New `ProbeBatteryResult` entries
  supersede old ones. A region may move out of `covered_regions` if a
  refresh fails the acceptance criteria. Implementations SHOULD apply
  a consecutive-failure rule or a smoothed scoring function such as
  an exponentially weighted moving average over the last N probe runs
  before emitting a coverage transition, so that single-run
  statistical noise does not drive spurious churn in the covered set.
- **Query.** A peer agent or principal queries the `CapabilitySurface`
  by submitting a task and receiving back (a) the classified region if
  in coverage, (b) the aggregate score and confidence for that region,
  and (c) the `uncovered_policy` action if the task is not in
  coverage.

The query operation is the protocol-level answer to Gans's information
economics problem [3]. A rational principal can now observe local
reliability (per-region) rather than relying on aggregate benchmarks
that hide the shape of capability.

![CapabilitySurface lifecycle. Baseline and refresh move regions in
and out of coverage. Battery version changes force full re-baseline.
Query is the per-region reliability read that peers and principals
use.](/agent-protocol-stack/figures/yathartha/capability_surface_lifecycle.png)

---

## 4. Integration with NERVE

Pratyahara NERVE [7] provides behavioral drift detection through
`MicroglialObserver` and `AgentNeuron` fingerprinting. The current
specification records a single `behavioral_fingerprint` for each agent,
against which subsequent behavior is compared. This conflates jaggedness
with drift in exactly the failure mode described in Section 2.3.

We propose three invariants that extend NERVE with
capability-conditional drift detection. These invariants do not replace
existing NERVE invariants; they refine the domain over which drift
detection is valid. Existing integrity guarantees remain intact for
covered regions.

### 4.1 N-16: Coverage-Conditional Drift

A `MicroglialObserver` MUST NOT *raise* a drift flag for a task that
does not map to a region in the agent's `covered_regions` set, and
MUST NOT raise a flag against a region whose latest probe is older
than `RefreshCadence`. Tasks outside coverage are classified as
jaggedness (unknown competence) rather than drift (change from known
baseline). The observer's response to an uncovered or stale task is
governed by the agent's declared `uncovered_policy`, not by drift
threshold logic.

**Form of the invariant.** N-16 is an **action-level safety property
on the `RaiseDrift` operation**, not a state-level claim about the
historical set of drift flags. Concretely, the TLA+ specification
encodes it as the enabling guard of `RaiseDrift(a, r)`:

```tla
RaiseDrift(a, r) ==
    /\ r \in covered[a]                                            \* (i)
    /\ (clockTick - lastRefreshAt[<<a, r>>]) <= RefreshCadence     \* (ii)
    /\ driftFlags' = driftFlags \cup {<<a, r, clockTick>>}
    /\ ...
```

A state-invariant formulation ("∀ flag ∈ driftFlags: the flag's region
is currently covered and fresh") would be unsatisfiable: `driftFlags` is
append-only while `covered_regions` and `clockTick` are mutable, so after
a flag is legitimately raised, a subsequent probe can shrink coverage or
time can advance past the freshness window, and a historically-correct
flag then falsifies the state-only form even though no rule was violated.
N-16 is therefore stated as an action-level property, which is what the
design requires.

**Rationale.** Drift is meaningful only with respect to a baseline. An
agent that has never been measured on task *X* cannot be said to have
"drifted" on task *X*; its behavior on *X* is outside the observed
domain. Flagging such behavior as drift produces false positives that
erode the integrity layer's credibility.

### 4.2 N-17: Probe Battery Maintenance

Each `AgentNeuron` MUST declare a `probe_battery` field that enumerates
the probe tasks used to establish and refresh its `CapabilitySurface`.
The probe battery MUST be version-controlled and content-addressed (a
SHA-256 hash over the canonical serialization). A change in the probe
battery is a distinct event and MUST trigger a full baseline re-run,
not a silent surface update.

**Rationale.** The capability surface has meaning only with respect to
its probe battery. Changing the battery changes the measurement. An
observer cannot compare a pre-change probe result to a post-change one;
they are measurements of different things. Versioning the battery makes
surface changes auditable and prevents a compromised agent from
silently redefining its own measurement. The canonical serialization
used for the hash SHOULD follow the JSON Canonicalization Scheme
(RFC 8785 [12]) to ensure that independent implementations computing
the digest of the same battery produce the same value.

### 4.3 N-18: Capability Surface Integrity

A change in the `covered_regions` set, whether from probe failures
(region moves out), new probes (region moves in), or policy changes
(uncovered policy adjustment), MUST be recorded as a distinct event
type `SurfaceChangeEvent`, separate from fingerprint drift within a
region. The `MicroglialObserver` MUST treat unexpected surface changes
as integrity signals in their own right, with escalation rules
separate from drift.

**Rationale.** An agent whose capability surface suddenly expands or
contracts is exhibiting a different kind of integrity signal than one
whose behavior on a covered task has drifted. A compromised agent may
claim expanded coverage it cannot actually deliver; a drifting agent
may lose coverage in regions where it used to be reliable. Separating
these events prevents one from being masked by the other.

### 4.4 Timescale and Cooperation

The two mechanisms run on fundamentally different timescales, and
this distinction is important for implementers. A probe battery is
scheduled, not continuous: it runs once at intake to establish
baseline and re-runs on a declared cadence such as hours, days, or
weeks, depending on how critical the agent is. Executing a probe
battery is relatively expensive because it means running a
standardized set of tasks and recording per-task results, and this
is not something an operator wants to do on every incoming request.
The `MicroglialObserver`, by contrast, runs continuously in real
time on every action the agent takes, comparing the observed
behavior against the fingerprint already stored in the
`CapabilitySurface` for the classified region. The observer does
not execute probes; it only consults the per-region fingerprint
that the most recent probe run left behind.

The two mechanisms cooperate by working on complementary loops. The
probe-battery loop maintains the fingerprints and the covered set
over time, in response to scheduled refresh or operator-triggered
re-probing. The observer loop reads those fingerprints and enforces
N-16 on every action: if the classified region is covered and
fresh, a drift check runs; if it is uncovered or stale, the
observer defers to the agent's declared `uncovered_policy`
instead. This decoupling is what makes the combined system
practical: the slow, expensive probe loop does not have to run on
the request critical path, and the fast, cheap observer loop does
not have to re-measure what the probe battery has already measured.

For deployments that implement NERVE core without the Yathartha
extension, no probe battery is required. The `MicroglialObserver`
falls back to single-fingerprint drift detection and accepts the
false-positive risk on jagged valleys described in Section 2.3.
Yathartha is an opt-in refinement, not a prerequisite.

A reference implementation is available in the companion Pratyahara
repository at <https://github.com/ravikiran438/pratyahara-nerve>.
The repository follows the same split used by the Anumati extensions
[7]: specification artifacts live under `extensions/yathartha/`
(`README.md`, `STATUS.md`, the TLA+ specification `Yathartha.tla`,
and the TLC configuration `Yathartha.cfg`), while the Python
implementation lives under `src/nerve/extensions/yathartha/`
(Pydantic types for the three primitives and runtime validators for
N-16 through N-18). A pytest suite of twenty-one invariant scenarios
is under `tests/extensions/test_yathartha.py`.

### 4.5 Combined Effect

With N-16, N-17, and N-18 in place, NERVE's behavioral monitoring
becomes capability-conditional. Drift signals are narrower and more
trustworthy, because they are gated on a baseline that actually
exists. Jaggedness is handled by the `uncovered_policy` route:
observe, defer, or reject. Surface changes are a new class of
event with their own handling.

The hardest case identified in Section 2.3, an agent that is both
jagged and drifting, is resolved by the interaction of N-17 and
N-18. When a refresh probes a previously covered region and the
new aggregate score falls below the region's acceptance threshold,
the region is moved out of `covered_regions` and a
`SurfaceChangeEvent` of kind `left` is recorded. Subsequent
observations of degraded behavior in that region are then routed
through `uncovered_policy`, not through drift detection. The
surface itself is what separates signal from noise in the
jagged-and-drifting case: drift is measurable only while the
region is covered, and the moment the region falls below threshold
the shape of the surface has changed, which is a distinct event
class with its own downstream handling.

The combined effect is a more precise defense surface that does
not confuse pre-existing incompetence with post-deployment
compromise.

---

## 5. Related Work

### 5.1 Jagged Intelligence Literature

Dell'Acqua et al. introduced the *jagged frontier* framing in their
2023 HBS field experiment with BCG consultants [2], which provides
the quantitative anchor: 40 percent higher quality on tasks inside
the frontier, and 19 percentage points less likely to be correct on
tasks outside it. Mollick and Euchner's 2024 interview in
Research-Technology Management popularized the framing and prescribes
organizational responses [1]. Gans's information-economics treatment provides
the theoretical framework for rational adoption under jagged capability
[3]. Chaudhri's Undark opinion piece argues for structured knowledge
bases as a mitigation [6]. None of these works addresses the protocol
layer. None proposes a measurement primitive that agents can publish
and principals can query.

### 5.2 Capability Evaluation Benchmarks

Benchmarks such as MMLU, BIG-Bench, and HumanEval aggregate
model performance across diverse tasks. They are used for inter-model
comparison, not for per-agent capability surface publication. A model's
aggregate MMLU score tells an operator little about how reliable that
model is on the operator's specific task mix. Published benchmark
scores do not serve the function that a `CapabilitySurface` would
serve: a queryable, agent-specific, refresh-cadenced map of where the
agent is actually reliable.

### 5.3 Agent Drift Detection

Rath et al.'s Agent Stability Index (ASI) proposes quantitative drift
metrics across twelve behavioral dimensions [10]. Becker et al.'s
DRIFTJudge identifies problem drift in multi-agent debate sessions
[11]. Both treat drift as an absolute property of agent behavior. Both
would benefit from conditioning on capability surface; both would flag
false positives on tasks the agent was never competent at.

The Yathartha framework is complementary to these methods. An ASI score
or a DRIFTJudge signal can be computed within a covered region and
used as the fingerprint comparison metric. The surface-level
conditioning is orthogonal: it determines whether the metric's output
is meaningful, not what the metric measures.

### 5.4 Formal Capability Specification

Prior work in program verification and API contracts specifies what a
system is expected to do. Capability surface differs in two respects.
First, it specifies what the system actually demonstrates (via the
probe battery), not what it is declared to do. Second, it is
refresh-cadenced and can change over time, whereas API contracts are
static. The closest analog is runtime contract verification, but
runtime verification assumes a fixed specification; capability surface
assumes an evolving one.

---

## 6. Limitations and Future Work

### 6.1 Probe Battery Design

The probe battery for a given region must be representative of the
region's task space. Poor battery design produces poor coverage
assessment: an agent can pass a battery of easy probes and fail real
tasks in the same nominal region. Battery design is domain-specific
and is currently an unsolved problem in the general case. For specific
domains (coding, summarization, arithmetic, scheduling), existing
benchmark suites provide candidate probes. For open-ended domains, no
principled design method exists.

### 6.2 Capability Region Classification

The query operation depends on classifying an incoming task into a
region. For some domains the classification is trivial (the agent
exposes one skill per region). For others it is itself a probabilistic
inference problem. A misclassified task is either treated as covered
when it should not be, or treated as uncovered when it could have
been handled. Both failure modes have costs. The paper's
`CS-3 Uncovered Conservatism` invariant favors false uncovered over
false covered, which is safer but more conservative.

### 6.3 Empirical Validation

This paper specifies the primitive and the invariants; it does not
provide empirical measurement. A natural next step is a simulation
study that injects drift at controlled rates into a jagged agent and
measures whether surface-conditioned drift detection (Yathartha plus
NERVE) produces fewer false positives than aggregate drift detection
(NERVE alone) while maintaining equivalent true-positive rates.

### 6.4 Adversarial Probe Batteries

A compromised agent that controls its own probe battery can publish a
battery easy enough to pass regardless of underlying behavior. The N-17
invariant requires probe battery content-addressing to make such
changes auditable, but does not prevent an adversary from initially
choosing a weak battery. Trusted third-party probe batteries, curated
by the agent network or a neutral registry, are a natural complement.
The specification of such registries is out of scope for this paper.

### 6.5 Relationship to Training-Time Methods

Yathartha is a deployment-time specification. It does not address
whether jaggedness can be reduced at training time through better data
curation or architectural choice. Gans's information-economics
framework argues that scaling laws improve average quality without
eliminating jaggedness [3]; empirical confirmation across model
families is ongoing. Even if training-time improvements reduce the
magnitude of jaggedness, the protocol-layer treatment remains
necessary, because deployed agents can still drift within their jagged
profile.

### 6.6 Benchmark Contamination and Goodhart's Law

A protocol primitive that makes probe-battery results into queryable
deployment artifacts creates two failure modes that do not apply to
benchmarks used once by a model developer. We describe them here
because any honest deployment of the primitive must address them.

The first is training-data contamination. Any publicly known probe
battery is likely present in the training corpus of a modern
generative model, which inflates measured competence on that battery
relative to held-out tasks in the same region. A `CapabilitySurface`
built from a public battery is therefore an overestimate of the
agent's actual capability, and peer agents that query the surface will
trust the agent in regions where it has only learned to pass the
probe.

The second is optimization pressure. Once a surface becomes a gate
that peers consult before engagement, every agent has a direct
incentive to score well on the probes, independently of whether the
underlying capability has improved. This is Goodhart's Law applied at
the protocol layer: the measure becomes the target, and the target
detaches from the construct the measure was meant to represent. An
honest agent does not need to intend this for it to occur; routine
fine-tuning that happens to include probe tasks in a training loop
produces the same result.

Both failure modes mean that probe-battery design cannot rely on
public benchmarks alone. Plausible mitigations include private
batteries curated by a trusted registry, rotation schedules that
replace the active battery periodically, and out-of-distribution
probe tasks that do not appear in any public corpus. The
specification of such a registry and its governance is out of scope
for this paper, but it is a necessary companion to any deployment of
the primitive in an adversarial setting.

### 6.7 Third-Party Probers and the Attestation Layer

The practicality of every safeguard in this paper reduces to a single
operational question: who runs the probe battery, and how does a peer
agent verify that a published `ProbeBatteryResult` reflects what
actually happened? The specification as written assumes the agent
runs its own probes and publishes its own results. Content-addressed
batteries (N-17) prevent silent battery swaps, but do not prevent
cherry-picked runs, selective reporting, or outright fabrication. The
framework as specified is therefore a contract between honest agents.
That is useful in trusted single-organization deployments, but it is
not adversarially robust in open multi-organization networks.

Every real-world analog of the probe-battery pattern addresses this
through third-party execution. Clinicians administer neuropsychological
batteries; patients do not self-score. Continuous integration runs
regression tests on independent infrastructure; developers do not
publish test results from their own laptops. Benchmark leaderboards are
computed by shared evaluation platforms; model developers do not run
the scoring code and submit their own numbers. The corresponding piece
of infrastructure for agent networks does not yet exist. Specifying it
is the natural companion work to this paper, and it is composed of
three pieces.

**Probe-execution runtime.** The execution of the probe battery itself
can be handled by existing open-source evaluation frameworks. Four
candidates are production-grade and maintained: Inspect [14] from the
UK AI Safety Institute, which has sandboxed task execution and
structured eval protocols; the LM Evaluation Harness [15] from
EleutherAI, which has the widest coverage of standardized benchmarks;
Promptfoo [16], designed for continuous-integration-style LLM testing;
and HELM [17] from Stanford CRFM, designed for multi-dimensional
holistic evaluation. Of these, Inspect is the closest structural match
because it assumes sandboxed execution under the control of a party
other than the model being evaluated, which is precisely the
assumption a third-party prober must enforce.

**Prober service architecture.** Running the framework is the easy
part. A third-party prober service is an operational layer on top: the
agent registers its battery specification, the prober runs the battery
independently against the agent, and the result is returned as a
signed `ProbeBatteryResult`. The pattern is analogous to
continuous-integration services (GitHub Actions, CircleCI, Buildkite)
that run tests on independent infrastructure rather than the
developer's machine. The specification of this service, including API
shape, authentication, and cost accounting, is out of scope for the
present paper.

**Attestation format and trust anchor.** Results returned by a prober
service MUST be signed with the prober's private key, and the prober's
public key MUST be resolvable by peers who want to verify the result.
A peer querying a `CapabilitySurface` then needs a way to decide
whether the signing prober is itself trustworthy, which is the same
problem TLS certificates solve through certificate authorities.
Possible structures include a federated registry of accredited probers
modeled on TLS CAs, a decentralized reputation system based on
cryptographic proofs of past honest behavior, or institution-anchored
trust through AI Safety Institutes, universities, or regulatory
bodies. The specification of the trust anchor is the hardest of the
three pieces and is also out of scope here.

Until these three components are specified and deployed, Yathartha's
value in adversarial settings is bounded by the trust relationships
that already exist inside a single deploying organization. In
single-organization or federated-partner deployments, this is fine;
the framework formalizes what would otherwise be an informal contract.
In open multi-organization agent networks, the attestation layer is
not optional.

---

## 7. Conclusion

Jagged intelligence is a structural property of current generative AI
systems, and the literature describing it has established the
phenomenon, measured its workplace impact, and proposed organizational
responses. The protocol layer has been untreated. Agent integrity
specifications that monitor behavioral drift without accounting for
jaggedness conflate two different phenomena and produce false positives
on tasks the agent was never competent at. The cost of the conflation
falls on the principal, who either sees the integrity layer's alerts
lose credibility or sees real drift signals hidden among jaggedness
noise.

Yathartha proposes a protocol-layer treatment. A `CapabilitySurface`
primitive records what the agent is actually competent at, published
on a refresh cadence and queryable by peers. Three derived invariants
(N-16 through N-18) extend the Pratyahara NERVE specification to
condition drift detection on the covered surface. The result is a
cleaner separation between what the agent has always failed at (handled
by the uncovered policy route) and what the agent has started to fail
at (handled by the drift route).

The primitive is agent-agnostic. It does not depend on a specific model
architecture, does not require retraining, and does not propose
behavioral change at training time. It is a measurement and
publication contract that any agent protocol can adopt alongside A2A
and MCP. It treats jaggedness as what it is: a property of the agent's
capability surface, to be mapped honestly rather than averaged away.

One practical caveat deserves explicit mention. The primitive's value
in adversarial settings is contingent on a third-party prober and
attestation layer that does not yet exist in the agent-protocol
ecosystem, and that is out of scope for this paper (see Section 6.7).
Until that layer is specified and deployed, Yathartha is a contract
between honest agents: useful, but not adversarially robust. The
specification of the prober service and the trust anchor that
backs it is the natural companion work.

---

## References

[1] Mollick, E. and Euchner, J. *The Jagged Frontier: Navigating AI's
    Uneven Capabilities*. Research-Technology Management, 2024. See
    also "The Shape of AI Jaggedness, Bottlenecks, and the Future," One
    Useful Thing, 2026.

[2] Dell'Acqua, F., McFowland, E., Mollick, E., Lifshitz-Assaf, H.,
    Kellogg, K., Rajendran, S., Krayer, L., Candelon, F., and
    Lakhani, K. R. *Navigating the Jagged Technological Frontier:
    Field Experimental Evidence of the Effects of AI on Knowledge
    Worker Productivity and Quality*. Harvard Business School
    Working Paper 24-013, September 2023.

[3] Gans, J. *A Model of Artificial Jagged Intelligence*. arXiv preprint
    arXiv:2601.07573, 2026.

[4] Liu, Y. et al. *Prompt Injection attack against LLM-integrated
    Applications*. arXiv preprint arXiv:2306.05499, 2025.
    https://arxiv.org/abs/2306.05499

[5] Greshake, K. et al. *Not What You've Signed Up For: Compromising
    Real-World LLM-Integrated Applications with Indirect Prompt
    Injection*. AISec 2023, pp. 79-90. ACM.

[6] Chaudhri, V. *Opinion: The Jagged Intelligence Problem and the Case
    for Knowledge Graphs*. Undark, February 19, 2026.

[7] Kadaboina, R. K. *Pratyahara: A Neural Tissue Defense Model for
    Detecting Compromised Agents in Multi-Agent Networks*. Zenodo,
    2026. DOI: 10.5281/zenodo.19628588.

[8] Linux Foundation AI & Data. *Agent2Agent (A2A) Protocol
    Specification*, 2026. https://a2aproject.org

[9] Anthropic. *Model Context Protocol Specification*, November 2025.
    https://modelcontextprotocol.io

[10] Rath, A. *Agent Drift: Quantifying Behavioral Degradation in
     Multi-Agent LLM Systems Over Extended Interactions*. arXiv
     preprint arXiv:2601.04170, 2026.
     https://arxiv.org/abs/2601.04170

[11] Becker, M. et al. *Problem Drift in Multi-Agent Debate*. Findings
     of EACL 2026.

[12] Rundgren, A., Jordan, B., and Erdtman, S. *JSON Canonicalization
     Scheme (JCS)*. RFC 8785, June 2020.
     https://datatracker.ietf.org/doc/rfc8785/

[13] Kadaboina, R. K. *Sauvidya: An Accessibility Protocol for
     Agent-to-Principal Interaction in Autonomous Agent Networks*.
     Zenodo, 2026. DOI: 10.5281/zenodo.19633138.

[14] UK AI Safety Institute. *Inspect: Open-Source Framework for
     AI Safety Evaluations*, 2024.
     https://inspect.aisi.org.uk/

[15] Gao, L., Tow, J., Biderman, S., Black, S., DiPofi, A., Foster,
     C., Golding, L., Hsu, J., McDonell, K., Muennighoff, N., and
     others. *A Framework for Few-Shot Language Model Evaluation
     (LM Evaluation Harness)*. EleutherAI, 2021-2024.
     https://github.com/EleutherAI/lm-evaluation-harness

[16] Promptfoo, Inc. *Promptfoo: Test and Evaluate LLM Output
     Quality*. 2023-2026. https://www.promptfoo.dev/

[17] Liang, P., Bommasani, R., Lee, T., Tsipras, D., Soylu, D.,
     Yasunaga, M., Zhang, Y., Narayanan, D., Wu, Y., Kumar, A., and
     others. *Holistic Evaluation of Language Models (HELM)*.
     Stanford CRFM, 2022. https://crfm.stanford.edu/helm/
