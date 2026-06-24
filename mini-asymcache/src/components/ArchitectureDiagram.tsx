export function ArchitectureDiagram() {
  return (
    <div className="grid gap-3 text-sm text-slate-100">
      <div className="diagram-node">Prompt Tokens</div>
      <div className="mx-auto h-4 w-px bg-cyan-300" />
      <div className="diagram-node">Prefill</div>
      <div className="mx-auto h-4 w-px bg-cyan-300" />
      <div className="diagram-node">KV Cache Blocks</div>
      <div className="mx-auto h-4 w-px bg-cyan-300" />
      <div className="diagram-node">Decode Engine</div>
      <div className="mx-auto h-4 w-px bg-cyan-300" />
      <div className="diagram-node">Output Tokens</div>
      <p className="mt-2 text-xs text-slate-300">Bottlenecks: memory pressure, cache miss, recomputation, TTFT, TPOT</p>
    </div>
  );
}
