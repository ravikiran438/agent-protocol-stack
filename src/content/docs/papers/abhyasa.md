---
title: "Abhyasa: Custody Transfer of Governance Obligations over Unreliable Channels in Agent Networks"
description: "Full paper. Deliver-or-report custody transfer for governance obligations over lossy agent channels."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Abhyasa: Custody Transfer of Governance Obligations over Unreliable Channels in Agent Networks*. Zenodo, 2026. [doi:10.5281/zenodo.20644821](https://doi.org/10.5281/zenodo.20644821). Reference implementation: [github.com/ravikiran438/abhyasa-protocol](https://github.com/ravikiran438/abhyasa-protocol).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

*Abhyasa* is Sanskrit for "sustained practice": the repeated, earnest effort by which a state is held against a substrate that will not hold it on its own.

---

## Abstract

Agent communication protocols and the transport bindings that
carry them (HTTP/SSE, WebSocket, and recent QUIC and Media-over-QUIC
mappings for the Model Context Protocol) are designed to deliver *messages*
reliably. None addresses whether a *governance obligation* carried
by a message, such as a consent decision or a corrective welfare signal,
survives a channel that is lossy, intermittent, or partitioned. Over such a
channel a best-effort governance message can be silently dropped, leaving an
agent acting without authorization or correction, with no party
aware the signal was lost.

Guaranteed delivery is impossible over an unreliable channel (the Two
Generals Problem; the FLP result), and by the end-to-end argument the
missing guarantee must be supplied at the endpoints, not by an intermediary
queue. But a governance obligation
whose loss carries *asymmetric* cost can declare a *fail-safe polarity*: a safe
default the sender applies locally when delivery is not confirmed. That local
fallback makes the problem tractable.

We propose **Abhyasa**, a transport-agnostic framework that delivers
governance obligations under a *deliver-or-report* guarantee. It lifts
the custody-transfer mechanism of delay-tolerant networking from opaque
bundles to governance obligations, pairs at-least-once delivery with
idempotent application for effectively-once semantics, and adds a
principal-side fail-safe that holds without a working reverse channel: every
obligation under custody is applied, explicitly declined, or
escalated to the principal, and none is silently lost. We instantiate the
framework on two governance invariants from companion work, *Anumati*
(consent) [Anumati] and *Phala* (welfare feedback) [Phala], as extensions to
the Agent2Agent (A2A) protocol and the Model Context Protocol (MCP), layering
above transport bindings such as MCP-over-MOQT.

---

## 1. Introduction

The Model Context Protocol [MCP] and the Agent2Agent protocol [A2A] began
over HTTP and Server-Sent Events; recent IETF drafts map them onto QUIC and
Media-over-QUIC Transport for low-latency, multiplexed, publish-subscribe
delivery without head-of-line blocking [7]. All of this work addresses the
same problem: moving *bytes* across the network efficiently and reliably.

A governance message is not only bytes: when a principal grants or revokes
consent, or when a principal's outcome signal instructs an agent to stop
preferring a pathway, the message carries an *obligation*, a constraint the
receiving agent is required to honor. The transport layer can deliver the
bytes of that message reliably and still leave the obligation unmet. If the
link degrades at the wrong moment, the consent revocation never arrives, or
the corrective signal is dropped, and the agent proceeds as though nothing
was said. Transport reliability is necessary but not sufficient for
governance correctness.

Two failures make the gap concrete. First, consent in flight: a principal revokes
authorization mid-session, and the revocation is delayed or lost on an
intermittent link. The agent, having seen no revocation, continues to act on
stale authority. Second, corrective feedback: an agent's outcome
resolves badly, the principal's negative welfare signal is computed and
dispatched, and the message is dropped before the downstream agent applies
it. The agent retains a preference the principal has rejected. In both cases
the dangerous outcome is the *default*, because silence is read as
continuation, and the receiving agent cannot recover the signal on its own:
it never learned the signal existed.

Three established results bound any solution (§2): delivery cannot be
guaranteed, the guarantee must live at the endpoints, and custody transfer
achieves reliability without continuous end-to-end connectivity. On top of
these, at-least-once delivery with idempotent application is the standard
engineering pattern used to cope with that impossibility in practice (§2.4).

The name (sustained practice) describes the mechanism: retry under custody
until the obligation is discharged, with a defined terminal state for when the
channel defeats every attempt.

This paper makes four contributions:

- The *governance-delivery gap*: delivering a message is not discharging the
  obligation it carries, and transport reliability cannot close the
  difference (§1–2).
- The *asymmetric-cost criterion* and the *fail-safe polarity* it induces,
  identifying which obligations need delivery assurance (§3).
- The **Abhyasa** framework: custody transfer of obligations, idempotent
  at-least-once delivery, and a principal-side fail-safe yielding a
  *deliver-or-report* guarantee (§4).
- Instantiations on *Anumati* (binary consent) [Anumati] and *Phala*
  (valence-signed welfare feedback) [Phala], two governance invariants from our
  companion work, as transport-agnostic extensions to A2A and MCP (§5).

The framework is not specific to these two invariants: any governance
obligation that can declare a fail-safe polarity (§3) can be carried under
Abhyasa, independently of the agents' internal architecture or the underlying
transport.

---

## 2. Foundations

Abhyasa is based on three established results and one well-known engineering
pattern.

### 2.1 Delivery cannot be guaranteed

The Two Generals Problem [1] establishes that two parties communicating only
over a channel that may drop messages can never reach common knowledge that
a message was received: no finite exchange of acknowledgments terminates the
uncertainty, because the last acknowledgment may always be the one that was
lost. The FLP impossibility result [2] generalizes the difficulty to
consensus in asynchronous systems with even a single faulty process. For
message delivery the consequence is that *exactly-once delivery is not an
achievable guarantee over an unreliable channel*. A sender that
receives no acknowledgment cannot distinguish a lost message from a lost
acknowledgment from a slow receiver.

Abhyasa therefore does not attempt guaranteed delivery. It targets the only
sound alternative: a guarantee that each obligation is *either* discharged
*or* reported as undischarged, never silently abandoned.

### 2.2 The guarantee belongs at the endpoints

The end-to-end argument [3] holds that a function such as reliable,
correct delivery can be completely and correctly implemented only with the
knowledge and participation of the endpoints; lower layers can improve
performance but cannot, on their own, provide the guarantee.

This has a direct architectural consequence: *an intermediary message queue
between two agents does not close the governance-delivery gap.* A durable
queue helps with outages (connection lost, then restored) by buffering
until the path returns. It does nothing for a path that is persistently
lossy. Worse, a naive queue can *mask* loss from the sender, reporting
success on enqueue while the obligation never reaches the receiver. The
custody and fail-safe logic of Abhyasa is therefore specified at the
endpoints (the orchestrating agent and the receiving agent), not delegated
to a broker.

### 2.3 Custody transfer: reliability without end-to-end connectivity

Delay-tolerant networking (DTN) [4] was designed for the regime that
breaks conventional transport: links that are intermittent, high-latency, or
never simultaneously end-to-end connected. Its reliability mechanism is
*custody transfer* [4, 5]: responsibility for eventual delivery is held
explicitly by a custodian, which retains the data and a retransmission
timer, and is transferred to a downstream node only when that node
acknowledges acceptance of custody. Reliability is achieved not by a
continuous reliable path but by a chain of nodes each accepting, holding,
and forwarding responsibility.

Abhyasa adopts custody transfer with one substantive change: the custodian
holds responsibility for a *governance obligation*, and the acknowledgment
confirms *application* of that obligation, not mere receipt of bytes.
Receiving the message is not discharging the obligation; honoring it, or
explicitly and accountably declining it, is.

### 2.4 At-least-once plus idempotency

The standard production answer to §2.1 is *at-least-once delivery
combined with idempotent processing*, which yields effectively-once
*application* even though exactly-once *delivery* is impossible [6]. The
sender retries until acknowledged; the receiver, recognizing a duplicate by
a stable identifier, applies the effect at most once. Durable messaging
systems and webhook delivery converge on this pattern, together with a
terminal escalation, the dead-letter path, for messages that cannot be
delivered within bounds.

Abhyasa uses this pattern as its delivery substrate (§4) and contributes two
things on top of it: a criterion for *which* obligations are carried this
way rather than best-effort (§3), and a fail-safe terminal state that
protects the principal locally when the substrate defeats delivery (§4).

---

## 3. The Asymmetric-Cost Criterion

An *obligation* is a message whose receiver is required to honor a
constraint it carries. The cost of losing an obligation in transit is
frequently asymmetric: one outcome under loss is safe, the other harmful.
A consent revocation lost in flight leaves an agent acting on withdrawn
authority; a corrective welfare signal lost in flight leaves an agent
retaining a rejected preference. In both, silence defaults to the harmful
outcome.

**Definition (Fail-safe polarity).** An obligation *O* declares a *fail-safe
polarity* if there exists a pure function `safe(O)` of its payload returning
the *principal-side* action the custodian must default to, without remote
cooperation, when *O* is not confirmed delivered. (`safe(O)` returns the
action; the custodian applies it locally, never the receiver.)

**AC-1 (Admissibility).** An obligation is *Abhyasa-admissible* iff it
declares a fail-safe polarity. Obligations with no defined safe default are
out of scope.

Symmetric messages such as telemetry and idempotent state sync carry no
asymmetric loss cost; Abhyasa does not apply, and they are left to whatever
ordinary delivery the deployment already uses (best-effort, or at-least-once
with idempotency where it provides it). Inadmissible obligations, including
reinforcing Phala updates (§5), take this same best-effort path.

---

## 4. The Abhyasa Framework

Abhyasa carries an admissible obligation under custody until it is discharged
or its loss is reported. The custodian is the sending agent. Discharge is
confirmed by a custody acknowledgment that attests *application*, not receipt.

```
CustodyAck = (obligation_id, target, status, acked_at)
status ∈ {applied, declined, deferred}
```

`applied`: the receiver applied the obligation, or idempotently recognized
it as already applied. `declined`: the receiver accountably refused; a
delivered outcome, logged, not retried. `deferred`: received, not yet
applied; custody remains undischarged.

**AB-1 (Custody).** An admissible obligation MUST be delivered under custody.
The custodian persists the pending obligation durably and retains
responsibility until it receives a `CustodyAck` of `applied` or `declined`, or
until the transfer reaches a terminal bound, the `deadline` or `max_retries`
(AB-2/AB-4), at which point custody is discharged by the fail-safe.

**AB-2 (Persistence).** On delivery timeout the custodian MUST retry, with
exponential backoff (initial interval `b`, multiplier 2, capped below the
deadline so that retries span the full `deadline` rather than exhausting early;
implementations SHOULD add jitter to avoid synchronized retries) until an
`applied`/`declined` ack, the `deadline`, or `max_retries`. After a crash it
recovers its pending custody set from durable storage and resumes, so a crash
delays rather than abandons a transfer.

**AB-3 (Idempotent application).** A receiver MUST apply an obligation at most
once, keyed on `obligation_id`, and MUST persist the applied `obligation_id`
durably, in the same atomic commit as the effect, so the at-most-once property
survives a receiver crash; otherwise a crash between application and
acknowledgment would let a redelivery reapply. A redelivered obligation already
applied MUST be acknowledged `applied` without reapplication. Delivery is
at-least-once; application is effectively-once.

**AB-4 (Fail-safe).** On `deadline`, or on exhaustion of `max_retries`,
whichever occurs first (AB-2 sizes `max_retries` so the deadline normally
binds), without `applied`/`declined`, the custodian MUST apply the action
returned by `safe(O)` (§3) to principal-side state and emit a
principal-visible escalation. That action needs no remote cooperation, so
AB-4 holds without a working reverse channel.

**Deliver-or-report (guarantee).** Assuming the custodian eventually resumes
after any crash, every admissible obligation terminates in `applied`,
`declined`, or escalated; none terminates in silent loss.

![The Abhyasa custody state machine. An admissible obligation moves
from *pending* to exactly one of the terminal discharge states *applied*,
*declined*, or *escalated*; duplicate redelivery and retry are self-loops on
*pending* that preserve effectively-once application (AB-3); the deadline or retry exhaustion
triggers the principal-side fail-safe (AB-4). Inadmissible obligations take
the dashed best-effort path and are not placed under custody.](/agent-protocol-stack/figures/abhyasa/custody_state_machine.png)

### 4.1 Scope

Abhyasa assumes *honest-but-unreliable* participants: agents may crash, omit,
delay, duplicate, or partition, but a `CustodyAck` reports its disposition
truthfully. Byzantine behavior, acknowledging `applied` without honoring the
obligation, is out of scope. The same boundary covers internal failures
particular to LLM-based agents: an agent that acknowledges in good faith but
fails to honor the obligation because of prompt injection, hallucination, or
context loss is, from the protocol's view, indistinguishable from a false
acknowledger, and is treated identically. Abhyasa therefore
guarantees *deliver-or-report*, not *enforcement*.

The fail-safe is bounded by what `safe(O)` can do locally. AC-1 excludes any
obligation whose safe default would need remote coordination or
partition-unavailable state, which is why workflows whose mitigation requires
distributed rollback are excluded by definition rather than handled
incorrectly. `safe(O)` protects the *principal-side* exercise of an
obligation: fully effective for Phala corrective updates, where the routing
weight is state the orchestrator owns, and for principal-mediated authority
in Anumati. Where a
downstream agent can exercise a standing capability autonomously, a lost
revocation cannot be enforced over a dead channel. There `safe(O)` is an
auditing and escalation mechanism, not a preventative safeguard, and
prevention must come from bounding such capabilities with short,
self-expiring lifetimes (time-bound leases [8]) so authority lapses by
timeout. The term "fail-safe" applies in the strict, preventative sense only
to principal-mediated obligations. Abhyasa accordingly targets cooperative
deployments, such as intra-domain agent meshes or agents under a common
operator, where the honest-but-unreliable assumption holds; enforcement
across adversarial trust boundaries needs attestation (for example a
Pramana claim attestation [Pramana]) or trusted execution and is out of
scope.

Because the fail-safe is timeout-triggered, it trades liveness for safety:
any delay that outlasts the deadline, whether a network partition, a
congestion spike, or slow processing or durable-write latency at the
receiver, fires a spurious escalation and, for fail-closed invariants, a
spurious withhold. As a sizing rule, `deadline` should exceed the longest
outage the deployment intends to ride out, so escalation signals an
unresponsive agent rather than routine degradation, with the backoff cap kept
well below `deadline` so several re-attempts fall within it. The
spurious-escalation rate is then bounded by the fraction of end-to-end
delivery delays, network or node-side, that exceed `deadline`.

Design notes covering the lost-acknowledgment reconciliation, overhead, the
pure-function boundary, and the full threat-model discussion accompany the
reference implementation [Impl].

### 4.2 Validation

A reference implementation, comprising the custody state machine, both
instantiations, the A2A AgentCard extension, and an MCP binding, accompanies
this specification under Apache-2.0 [Impl], with a conformance suite and a
runnable lossy-channel demo. The custody machine is also specified in TLA+ and
model-checked with TLC: for a bounded instance (parameters in [Impl]) the
search is exhaustive and reports no violation of its safety invariants
(bounded retries, effectively-once application, escalation always applying
`safe(O)`, no admissible obligation in a silent terminal, and the benign side
staying best-effort) or of the deliver-or-report liveness property.

The model's scope is the protocol logic under channel faults: loss and
duplication of obligations and acknowledgments. It does not model durable
storage or node crashes. Crash tolerance enters the design through the
durability requirements of AB-1, AB-2, and AB-3, which are normative
obligations on implementations, not properties of the abstract machine. The
reference implementation realizes them with a write-ahead pending set on the
custodian and an applied-id ledger committed atomically with the effect on
the receiver, and the conformance suite includes crash-recovery tests: a
custodian killed mid-retry resumes the transfer from its pending set on
restart; a receiver killed between application and acknowledgment re-acks the
redelivery without reapplying; and a transfer recovered into a still-dead
channel terminates escalated with the fail-safe applied, so deliver-or-report
holds across the crash. The guarantees stated in §4 are accordingly
model-checked within the bounded model and fault model (parameters and the fuzz harness in [Impl]), and conditional
on an implementation meeting those durability requirements. A parametric
proof (via TLAPS), a crash-extended model, and a comparative empirical study
against a best-effort baseline (steady-state latency and throughput cost of
the two durable writes, and spurious-escalation rate as a function of
partition duration) are future work.

---

## 5. Instantiation on Governance Invariants

Two invariants supply `safe(O)`, on different polarity axes. Admissibility
(AC-1) is per-instance: an obligation is carried under custody only when it
declares a fail-safe polarity, so `safe(O)` is defined exactly for the
admissible rows below.

| Invariant | Polarity | Admissible (AC-1) | `safe(O)` |
|---|---|---|---|
| Anumati (consent) | binary | yes | withhold principal-mediated authority (fail-closed) |
| Phala, corrective (`valence < 0`) | signed | yes | down-weight principal-side routing to the target |
| Phala, reinforcing (`valence ≥ 0`) | signed | no | none (inadmissible; benign loss, delivered best-effort) |
| OAuth, token revocation | binary | yes | authorization server stops honoring the token (fail-closed) |
| OAuth, token issue/refresh | binary | no | none (inadmissible; benign loss, client retries) |

Anumati exercises the binary case: an unconfirmed grant or revocation defaults
to fail-closed. One clarification on where the action happens, since `safe(O)`
is otherwise an AB-4 fallback: a revocation is the principal's own decision, so
the principal-side authorization update (the orchestrator ceasing to permit
the revoked authority) is applied *immediately and unconditionally* when the
decision is issued, not only on timeout, and is never gated on the remote
acknowledgment. What Abhyasa carries under custody is the *propagation* of that
decision to the remote agent, so the agent too ceases (under deliver-or-report).
`safe(O)` is the fallback for that propagation: on a confirmed `applied`/`declined`
the local withhold already stands and the agent is known to have been informed;
on timeout, AB-4 re-asserts the principal-side withhold (idempotently, since it
is already fail-closed) and escalates the un-notified agent.

Phala exercises the signed case: per-instance polarity is given by the sign of
`valence` (see [Phala]), so only corrective obligations are admissible and
carried under custody (AB-1 to AB-4); reinforcing obligations are inadmissible
and travel best-effort, since their loss is the benign default.

The admissible class is not limited to these two protocols. **OAuth token
revocation** [9] is a standard instance, defined independently of
this work, of the same binary fail-closed shape. For resource servers that cache validation
autonomously, the withhold degrades to the report branch, which is why OAuth
already pairs revocation with short token lifetimes (the §4.1 lease
mitigation). More generally, as with UMA and similar revocation-bearing
standards, wherever an obligation declares a locally executable fail-safe
polarity it is Abhyasa-admissible, independently of who authored it.

The binding is transport-agnostic. Because custody is cross-cutting, it is
advertised once per agent rather than per instantiation: under A2A, an agent
declares a single Abhyasa AgentCard extension carrying an agent-level
*custody-ack endpoint* and a list of per-kind profiles, one for each governance
kind it carries under custody; each profile names that kind's *obligation
endpoint*, `deadline`, and retry budget. An obligation is POSTed to its kind's
obligation endpoint, and the `CustodyAck` returns on that response or
asynchronously to the custody-ack endpoint. Anumati, Phala, OAuth, and any other
admissible kind plug in by adding a profile; none carries custody fields of its
own. Under MCP, the obligation rides the tool call and the `CustodyAck` returns
on the result or a subsequent call. Field-level definitions are in the reference
implementation.

---

## 6. Related Work

Transport bindings for agent protocols, including MCP-over-MOQT [7], deliver
bytes; Abhyasa sits above them and carries obligations. Custody transfer
originates in delay-tolerant networking [4, 5], where a custodian holds
responsibility for a bundle; Abhyasa holds it for a governance obligation and
acknowledges application rather than receipt. At-least-once delivery with
idempotent application [6] is its delivery substrate; on top of it Abhyasa adds
the asymmetric-cost criterion (§3) and the principal-side fail-safe (§4).

Actor systems pair at-least-once delivery with idempotency and route
undeliverable messages to a dead-letter queue or a supervisor, and production
supervisors (Erlang/OTP, Akka) routinely execute domain-specific recovery
logic on failure. Abhyasa is not a competing supervision mechanism; the
difference lies in what is selected and what is promised. Supervision policy
attaches to actors and their lifecycles, and fires on process failure or
unreachability; Abhyasa attaches to individual messages, selected at admission
by the asymmetric-cost criterion (§3), and fires on non-confirmation of
*application* within a deadline. Its terminal action is a declared,
per-obligation `safe(O)` executed on principal-side state under a stated and
model-checked deliver-or-report contract, rather than a restart or
escalation strategy for a process. The two compose: an OTP supervisor could
host an Abhyasa custodian, and the framework formalizes the contract such a
supervisor would have to satisfy for governance traffic.

The same discipline already operates, at global scale and without distributed
consensus, in payments. Card and bank settlement does not achieve exactly-once
delivery (the impossibility of §2.1 applies equally to money); it pairs
idempotency keys with a two-phase authorize/capture flow and an out-of-band
reconciliation-and-reversal layer, so every transaction is captured, declined,
or surfaced for reconciliation: a *deliver-or-report* guarantee for value,
where the "report" is the settlement dispute path. Agent-payment efforts such
as AP2 [AP2] layer verifiable authorization mandates and cryptographic audit
trails over those rails. Abhyasa generalizes the same reconcile-or-report
discipline from the narrow, heavily standardized domain of payments to
arbitrary governance obligations, with `safe(O)` as the per-obligation
analogue of a reversal and escalation as the reconciliation trigger.

The obligations themselves come from agent governance protocols, Anumati for
consent and Phala for welfare feedback, for which Abhyasa is the delivery
layer.

---

## 7. Conclusion

A transport binding delivers the message; Abhyasa delivers the obligation the
message carries, or reports that it could not. Every admissible obligation
terminates as applied, declined, or escalated, never as silent loss. A
parametric proof and a comparative empirical evaluation are left to future
work.

---

## References

[1] Gray, J. *Notes on Data Base Operating Systems*. In Operating Systems:
    An Advanced Course, LNCS 60, Springer, 1978. (Two Generals Problem.)

[2] Fischer, M. J., Lynch, N. A., and Paterson, M. S. *Impossibility of
    Distributed Consensus with One Faulty Process*. Journal of the ACM,
    32(2):374–382, 1985.

[3] Saltzer, J. H., Reed, D. P., and Clark, D. D. *End-to-End Arguments in
    System Design*. ACM Transactions on Computer Systems, 2(4):277–288, 1984.

[4] Cerf, V., Burleigh, S., Hooke, A., Torgerson, L., Durst, R., Scott, K.,
    Fall, K., and Weiss, H. *Delay-Tolerant Networking Architecture*.
    RFC 4838, IETF, 2007.

[5] Burleigh, S., Fall, K., and Birrane, E. *Bundle Protocol Version 7*.
    RFC 9171, IETF, 2022.

[6] Helland, P. *Idempotence Is Not a Medical Condition*. Communications of
    the ACM, 55(5):56–65, 2012.

[7] Jennings, C., Swett, I., Rosenberg, J., and Nandakumar, S. *Model
    Context Protocol over Media over QUIC Transport*.
    Internet-Draft draft-jennings-mcp-over-moqt-00, IETF, October 2025.
    https://datatracker.ietf.org/doc/draft-jennings-mcp-over-moqt/

[8] Gray, C., and Cheriton, D. *Leases: An Efficient Fault-Tolerant Mechanism
    for Distributed File Cache Consistency*. In Proceedings of the 12th ACM
    Symposium on Operating Systems Principles (SOSP), pp. 202–210, 1989.

[9] Lodderstedt, T., Dronia, S., and Scurtescu, M. *OAuth 2.0 Token
    Revocation*. RFC 7009, IETF, 2013.

[Impl] Kadaboina, R. K. *Abhyasa Protocol: Reference Implementation*
    (custody state machine, Anumati/Phala/OAuth instantiations, A2A extension,
    MCP binding, and conformance suite). Apache-2.0.
    https://github.com/ravikiran438/abhyasa-protocol

[A2A] Linux Foundation AI & Data. *Agent2Agent (A2A) Protocol
    Specification*, 2026.

[MCP] Anthropic. *Model Context Protocol Specification*, November 2025.

[AP2] Google and collaborators. *Agent Payments Protocol (AP2)*, 2025.
    https://ap2-protocol.org/

[Anumati] Kadaboina, R. K. *Anumati: Proof of Adherence as a Formal Consent
    Model for Autonomous Agent Protocols*. arXiv:2604.16524 [cs.CR], 2026.
    https://doi.org/10.48550/arXiv.2604.16524

[Phala] Kadaboina, R. K. *Phala: Principal-Declared Welfare Feedback for
    Autonomous Agent Networks*. Zenodo, 2026.
    https://doi.org/10.5281/zenodo.19625611

[Pramana] Kadaboina, R. K. *Pramana: A Protocol-Layer Treatment of Claim
    Verification in Autonomous Agent Networks*. arXiv:2605.20312 [cs.CR], 2026.
    https://doi.org/10.48550/arXiv.2605.20312
