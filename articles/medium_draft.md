# I Built a Visual KV-Cache Simulator to Understand Why LLM Inference Is a Systems Problem

Recent LLM work increasingly reminds me that inference performance is not just “model quality” or “faster GPUs.” It is also a systems scheduling and memory-management problem.

I read a recent paper on KV-cache management and built a simulator to explore the same core idea:

how eviction policy decisions affect latency when memory is tight.

## Why KV cache matters

KV caches avoid recomputing attention context on every decode step, which lowers both compute and end-to-end latency. But for long prompts, KV data can dominate memory usage and force evictions.

When a block is evicted, future tokens may need recomputation, raising TTFT and sometimes TPOT if misses are frequent.

## Why long-context inference creates memory pressure

As context grows, cache size grows linearly with sequence length. In a multi-session setup, this compounds quickly. At service scale, the system has to trade:
- prompt reuse
- memory footprint
- latency spikes from recomputation

## Why cache eviction affects TTFT and TPOT

Hit-rate is useful, but incomplete.

In a strict hit-rate model:
- a cache can look good on paper
- but may keep cheap-to-recompute tokens
- and still pay avoidable latency.

The educational simulator shows this by reporting separate policy traces for:
- latency impact
- recomputation volume
- memory pressure windows

## What I built in Mini-AsymCache

- Synthetic workload generator (short chat, long context, mixed production)
- Blocked KV cache model
- Eviction policies: LRU, LFU, position-aware, and latency-aware
- Animated timeline of hits, misses, inserts, evictions, recomputation
- Side-by-side policy comparison and charting

The latency-aware policy uses configurable weights for:
- recency
- frequency
- recomputation cost
- position importance

This makes the trade space explicit instead of hard-coding one strategy.

## Results and observations

From runs in the simulator:
- In long-context workloads, cache misses and recomputation make latency differences sharper.
- On mixed workloads, policies that account for recomputation and position can outperform pure hit-rate policies.
- The policy with the highest hit rate is not always the policy with the lowest latency.

This is exactly the point I wanted to make explicit: LLM serving is an optimization system as much as it is a model-serving problem.

## Engineering lessons

- Latency-aware policies need an explicit objective.
- Policy behavior should be tunable per workload regime.
- Visual instrumentation is essential for debugging serving intuition.

## What this simulator does not reproduce

- Real CUDA kernels
- Full AsymCache internals
- vLLM/TensorRT-LLM direct integration
- Production-scale scheduler behavior

## What to do next

- Add per-request priorities
- Add token-level reuse tracing
- Replace simplified estimates with optional, calibrated profiles

## Closing

I built this as an educational artifact so the systems intuition becomes visible. If you are building serving infrastructure, this can be a useful way to reason about why “higher hit rate” is not enough.
