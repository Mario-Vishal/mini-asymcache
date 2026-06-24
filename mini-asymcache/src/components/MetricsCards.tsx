import { memo } from "react";

interface MetricProps {
  metrics: {
    hitRate: string;
    missRate: string;
    recompute: string;
    ttft: string;
    tpot: string;
    totalLatency: string;
    peakMemory: string;
  };
}

export const MetricsCards = memo(function MetricsCards({ metrics }: MetricProps) {
  const entries = [
    ["Hit Rate", metrics.hitRate],
    ["Miss Rate", metrics.missRate],
    ["Recompute Cost", metrics.recompute],
    ["Estimated TTFT", metrics.ttft],
    ["Estimated TPOT", metrics.tpot],
    ["Total Latency", metrics.totalLatency],
    ["Peak Memory", metrics.peakMemory]
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {entries.map(([label, value]) => (
        <div key={label} className="stat-card">
          <div className="text-xs uppercase tracking-wide text-slate-300">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
      ))}
    </div>
  );
});
