I read a recent paper on KV-cache management for LLM serving and built a small visual simulator to test what the paper’s framing means in practice.

The key lesson is simple: LLM inference is not only a model problem.  
As prompts get longer and concurrency grows, GPU memory becomes a first-class bottleneck.

In practice, cache misses can trigger recomputation, which changes TTFT and TPOT behavior even when hit rate looks good.

That means the “best” policy is not always the policy with highest hit rate.  
The most practical policy is the one that minimizes serving cost under real workload pressure.

I implemented **Mini-AsymCache**, an educational simulator with:
- LRU, LFQ, position-aware, and latency-aware policies  
- animated cache state and request timeline  
- policy-level comparison on latency, recomputation, and memory utilization  

No claim of full research reproduction—this is a teaching tool.  
But it made the systems tradeoffs much more concrete for me:

✅ hit rate only tells part of the story  
✅ recomputation cost and position importance can dominate decision quality  
✅ latency-aware eviction is often the right framing for production serving

If your team is building serving stacks, this is where models, memory, and scheduling meet.  
That intersection is where most real performance work now happens.
