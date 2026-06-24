export function Header() {
  return (
    <div className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Mini-AsymCache</p>
          <h1 className="text-lg font-semibold md:text-2xl">KV Cache Serving Simulator</h1>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200">Visual systems simulator</span>
      </div>
    </div>
  );
}
