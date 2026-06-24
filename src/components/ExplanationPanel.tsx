export function ExplanationPanel() {
  return (
    <div className="card glass">
      <h2 className="section-title">Why this simulator exists</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-200">
        <p>
          Large language model inference keeps KV cache blocks so recent attention can reuse previous tokens without full recomputation.
          As prompts grow, KV cache grows with them, and GPU memory becomes a hard limit.
        </p>
        <p>
          This simulator models how misses and misses-asynchronous recomputation shape TTFT and TPOT. A block hit removes recomputation for
          that segment; a miss may require recomputation and extra latency.
        </p>
        <p>
          The key lesson: maximizing hit rate alone is not always best. A low-cost-to-recompute block can be evicted safely while a
          high-cost block should often stay resident for lower end-to-end serving cost.
        </p>
        <p>
          The latency-aware policy blends recency, frequency, recomputation cost, and position to emulate the teaching point behind AsymCache:
          policy quality is measured by serving latency, not just cache hit rate.
        </p>
      </div>
    </div>
  );
}
