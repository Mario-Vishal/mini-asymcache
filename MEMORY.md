# MINI-ASYMCACHE MEMORY

Date started: 2026-06-24  
Project intent: Build a **ready-to-run educational React simulator** inspired by the paper *Multi-Segment Attention: Enabling Efficient KV-Cache Management for Faster Large Language Model Serving* (arXiv:2606.02964), without claiming full reproduction.

## 1. Paper understanding

### What problem the paper solves
KV-cache management in LLM serving is typically treated as a generic hit-rate optimization problem, but the paper identifies that this misses an important dimension: different cached blocks create different **latency impact** during future attention computation. AsymCache targets this gap.

### Why KV-cache management matters for LLM serving
During inference, KV caches prevent recomputing all previous attention states. In real systems:
- fewer recomputations reduce TTFT
- better memory utilization increases concurrency
- stale cache strategy choices can lower throughput even with good hit rates.

### Why long-context inference creates memory pressure
From the paper:
- KV storage scales with context length.
- Long prompts and multi-session workloads quickly dominate GPU memory.
- Paper data says a 32K context in large models can consume >40GB in half precision, which exceeds many cards’ practical cache headroom.

### What Multi-Segment Attention is trying to improve
It enables non-contiguous KV usage in one kernel path, so the serving engine can keep useful blocks in GPU memory even when there are holes from evictions. That increases practical flexibility for eviction policies.

### What AsymCache means by computation-latency-aware cache management
The central idea is to keep blocks that improve kernel efficiency and expected latency, not just frequent or recent ones. The paper combines:
- block-level future reuse signals
- position-aware recomputation penalties
- kernel behavior awareness.

### Why cache hit rate alone is not enough
The paper argues (and our simulator reflects) that a policy with high hit rate can still perform poorly if retained blocks are cheap to recompute or low-utility for attention execution. So minimizing latency is the primary objective.

### How recomputation cost affects TTFT and TPOT
When a miss happens, recomputation can increase prefill-like compute before the first token (TTFT). For later decoding steps, additional recomputation can raise per-token overhead, affecting TPOT.

### What adaptive chunking is trying to solve
Adaptive chunking balances:
- larger compute chunks (fewer launches, higher hardware utilization)
- recomputation overhead and memory pressure caused by missing segments.
This dynamic trade-off is a second-order scheduler optimization in AsymCache.

## 2. Implementation boundary

### What this project implements
- educational simulator with animated timeline + memory view
- synthetic workload generator
- KV-cache block model
- LRU, LFU, position-aware, and latency-aware eviction policies
- simplified TTFT / TPOT / latency estimates
- React visualization UI
- animated cache timeline
- charts and policy comparison
- markdown drafts for Medium and LinkedIn

### What this project does not implement
- full AsymCache reproduction
- real Multi-Segment Attention kernel
- custom CUDA kernels
- production GPU attention kernels
- vLLM / TensorRT-LLM integration
- exact benchmark reproduction from the paper

## 3. Design decisions

### Decision: synthetic workloads instead of real traces
- Reason: keeps project fast to run on any laptop with deterministic behavior.
- Trade-off: less representative of real deployment traces.
- Limitation: conclusions are educational and comparative only.

### Decision: block-level memory model with simplified costs
- Reason: makes recomputation and hit/miss behavior understandable in one screen.
- Trade-off: ignores layer-level and tensor-level cache behavior.
- Limitation: cannot map to exact kernel throughput numbers.

### Decision: explicit latency-aware policy as weighted score
- Reason: mirrors the paper framing while remaining configurable.
- Trade-off: requires tuning alpha/beta/gamma/delta and normalizations.
- Limitation: score is illustrative, not a production-calibrated proxy.

### Decision: Framer Motion + Tailwind + Recharts stack
- Reason: high signal/low-friction visual + chart updates.
- Trade-off: added dependencies versus pure SVG/CSS.
- Limitation: visual polish can hide underlying model assumptions.

### Decision: fixed request-level policy evaluation (all policies in one run)
- Reason: users can compare outcomes side-by-side.
- Trade-off: same workload repeated per policy, not shared adaptive state.
- Limitation: does not model cross-policy interference in scheduler queues.

## 4. Simulator assumptions

### token-to-memory conversion
`blockSizeMb = max(0.5, tokenCount * bytesPerTokenMb)`  
Where `bytesPerTokenMb = 0.00036`.

### prefill cost per token
`prefillCostMs = promptTokens * prefillCostPerToken`  
`prefillCostPerToken = 0.045ms`.

### decode cost per token
`decodeCostMs = outputTokens * decodeCostPerToken`  
`decodeCostPerToken = 0.065ms`.

### recomputation cost
For a miss block:
`recomputeCostMs = missingTokens * recomputeCostPerToken`  
`recomputeCostPerToken = 0.08ms`.

### cache block size
`sizeMb = max(0.5, tokensInBlock * tokenToMemoryRatio)`  
`tokenToMemoryRatio = 0.00036`.

### cache miss penalty
`cacheMissPenaltyMs = misses * cacheMissPenaltyPerMiss`, with  
`cacheMissPenaltyPerMiss = 1.2ms`.

### memory capacity model
Capacity is hard GPU KV-memory budget in MB; all blocks count against capacity by size.

### TTFT estimate
`TTFT = prefillCost + recomputationPenaltyFromMisses + cacheMissPenalty`.

### TPOT estimate
`TPOT = (decodeCost / outputTokens) + (cacheMissPenalty / requestCount)`.

### total latency estimate
`totalLatency = Σ(TTFT per request + outputTokens * TPOT per request)`.

These are illustrative formulas and not benchmark-grade.

## 5. Experiment notes

Scenarios below use the simulator’s synthetic workloads with the same request seed so all policies are compared on identical requests.

### Short chat workload
- Winner by latency: Latency-aware usually ties with Position-aware depending on weights.
- Highest hit rate is not always best latency.
- TTFT: lower than long-context cases; misses are usually less costly.
- TPOT: often similar across policies unless misses are clustered.
- Learning: low memory pressure reduces difference between policies.

### Long-context workload
- Winner by latency: Latency-aware generally better for TPOT-sensitive cases.
- Highest hit rate can still lose if it keeps cheap-to-recompute blocks.
- TTFT rises quickly with block evictions under constrained memory.
- TPOT grows with repeated recomputation events.
- Learning: preserving expensive blocks helps offset lower hit rate.

### Mixed production workload
- Winner by latency: usually Latency-aware with balanced weights.
- Hit rate alone tends to over-rank LFU in some patterns.
- TTFT and TPOT diverge by access phase (short burst vs long context burst).
- Learning: adaptive policies better adapt to mixed request shapes.

### Low-memory condition
- Winner by latency: Latency-aware (often with stronger recompute weight).
- Hit-rate-maximizing policies tend to evict late/recent expensive blocks first.
- TTFT spikes when many misses are recomputed.
- TPOT gets unstable and visibly worse.
- Learning: memory pressure turns recomputation-awareness into a first-order signal.

### High-reuse condition
- Winner by latency: Position-aware and Latency-aware compete closely.
- Highest hit rate policy often aligns with latency winner when reuse dominates.
- TTFT and TPOT both improve significantly.
- Learning: when reuse is strong, position and recency signals both help.

### Low-reuse condition
- Winner by latency: Latency-aware, sometimes LFU if gamma/weights are low.
- Highest hit rate is often weakly correlated with best latency.
- TTFT can still stay moderate if recomputation penalties are low.
- TPOT is mostly driven by miss penalty and decode scale.
- Learning: in low-reuse regimes, recomputation-aware policies avoid expensive rework.

## 6. Implementation notes (living)

- Current simulator is block-event based and deterministic via seeded generation.
- Charts and timeline are designed for visual learning, not system accuracy.
- Every run generates cache events, memory profile, and policy-by-policy summary cards.
