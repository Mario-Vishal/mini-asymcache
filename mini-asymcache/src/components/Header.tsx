export function Header() {
  return (
    <header className="top-header">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="space-y-1">
          <p className="header-kicker">Mini-AsymCache</p>
          <h1 className="text-lg font-semibold md:text-2xl">KV Cache Serving Simulator</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200">
          <span className="status-dot" />
          Visual systems simulator
        </div>
      </div>
    </header>
  );
}
