import { CacheBlock, CacheEvent } from "../simulator/types";
import { motion, AnimatePresence } from "framer-motion";

const statusClass: Record<CacheBlock["status"], string> = {
  hit: "from-emerald-400 to-emerald-200",
  miss: "from-amber-400 to-orange-200",
  insert: "from-cyan-400 to-sky-200",
  evict: "from-rose-500 to-rose-300",
  recompute: "from-fuchsia-400 to-indigo-300",
  idle: "from-slate-400 to-slate-300"
};

export function CacheVisualizer({
  blocks,
  events,
  capacityMb,
  totalEvictions
}: {
  blocks: CacheBlock[];
  events: CacheEvent[];
  capacityMb: number;
  totalEvictions: number;
}) {
  const totalMemory = blocks.reduce((sum, block) => sum + block.sizeMb, 0);
  const ratio = capacityMb > 0 ? Math.min(1, totalMemory / capacityMb) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-sm text-slate-200">GPU memory usage</p>
        <div className="h-4 w-full overflow-hidden rounded-full bg-black/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.round(ratio * 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-300">
          {totalMemory.toFixed(2)} MB used of {capacityMb} MB
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="sync">
          {blocks.map((block) => (
            <motion.div
              key={block.blockId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl border border-white/10 bg-gradient-to-br p-3 ${statusClass[block.status]}`}
            >
              <div className="text-xs font-medium text-slate-900">Request {block.requestId}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Segment {block.segmentId}</div>
              <div className="mt-2 text-xs text-slate-900">
                <p>Tokens: {block.startToken}-{block.endToken}</p>
                <p>Size: {block.sizeMb.toFixed(2)} MB</p>
                <p>Access count: {block.accessCount}</p>
                <p>Recompute cost: {block.recomputeCostMs.toFixed(1)} ms</p>
                <p>Position importance: {block.positionImportance.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-4 text-xs md:grid-cols-2">
        <p>Hit: recent reuse confirmed</p>
        <p>Miss: block not in cache</p>
        <p>Recomputed: missing block replayed</p>
        <p>Evicted: removed to fit memory pressure</p>
        <p className="md:col-span-2 text-amber-300">Total evictions: {totalEvictions}</p>
      </div>

      <div className="text-xs text-slate-300">Latest events: {Math.min(12, events.length)} of {events.length}</div>
    </div>
  );
}
