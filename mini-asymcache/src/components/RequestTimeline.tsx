import { CacheEvent } from "../simulator/types";
import { motion } from "framer-motion";

function colorFor(eventType: CacheEvent["eventType"]) {
  if (eventType === "HIT") return "hit";
  if (eventType === "MISS") return "miss";
  if (eventType === "INSERT") return "insert";
  if (eventType === "EVICT") return "evict";
  return "recompute";
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
          className={`timeline-item timeline-${colorFor(event.eventType)}`}
        >
          <div className="text-[11px] font-semibold text-slate-900">
            <span>{event.timestamp}</span>
            <span className="float-right uppercase text-[10px]">{event.eventType}</span>
          </div>
          <div className="mt-1 text-xs text-slate-700">req: {event.requestId} · block: {event.blockId}</div>
          <div className="mt-1 text-xs text-slate-700">Latency penalty: {event.latencyPenaltyMs.toFixed(2)} ms</div>
          {event.details ? <div className="mt-1 text-xs text-slate-700">{event.details}</div> : null}
        </motion.div>
      ))}
    </div>
  );
}