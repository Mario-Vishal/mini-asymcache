import { CacheEvent } from "../simulator/types";
import { motion } from "framer-motion";

function colorFor(eventType: CacheEvent["eventType"]) {
  if (eventType === "HIT") return "from-emerald-300 to-emerald-100";
  if (eventType === "MISS") return "from-amber-300 to-amber-100";
  if (eventType === "INSERT") return "from-cyan-300 to-cyan-100";
  if (eventType === "EVICT") return "from-rose-300 to-rose-100";
  return "from-fuchsia-300 to-fuchsia-100";
}

export function RequestTimeline({ events }: { events: CacheEvent[] }) {
  const recent = events.slice(-40);
  return (
    <div className="timeline-wrap">
      {recent.length === 0 && <p className="text-sm text-slate-300">Run the simulator to populate the event timeline.</p>}
      {recent.map((event) => (
        <motion.div
          key={event.eventId}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className={`timeline-item bg-gradient-to-r ${colorFor(event.eventType)}`}
        >
          <div className="text-[11px] text-slate-900">
            <span className="font-semibold">{event.timestamp}</span> · <span>{event.eventType}</span>
          </div>
          <div className="text-xs text-slate-700">
            req: {event.requestId} · block: {event.blockId}
          </div>
          <div className="text-xs text-slate-700">Latency penalty: {event.latencyPenaltyMs.toFixed(2)} ms</div>
        </motion.div>
      ))}
    </div>
  );
}
