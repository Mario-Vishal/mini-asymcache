import { Scatter, ScatterChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart, ResponsiveContainer, Bar, BarChart, Legend } from "recharts";

interface MemoryPoint {
  name: string;
  memory: number;
  latency: number;
}

interface DataRow {
  policy: string;
  latency: number;
  hitRate: number;
  recompute: number;
  memory: number;
}

export function ChartsPanel({
  comparisonData,
  memoryTimeline
}: {
  comparisonData: DataRow[];
  memoryTimeline: MemoryPoint[];
}) {
  return (
    <div className="space-y-6">
      <div className="chart-shell">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-300">Total latency by policy</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" />
            <XAxis dataKey="policy" stroke="#97a6c7" />
            <YAxis stroke="#97a6c7" />
            <Tooltip />
            <Legend />
            <Bar dataKey="latency" fill="#4e93ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="chart-shell h-64">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-300">Hit rate by policy</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" />
              <XAxis dataKey="policy" stroke="#97a6c7" />
              <YAxis stroke="#97a6c7" />
              <Tooltip />
              <Bar dataKey="hitRate" fill="#55f6d9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-shell h-64">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-300">Recompute cost by policy</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" />
              <XAxis dataKey="policy" stroke="#97a6c7" />
              <YAxis stroke="#97a6c7" />
              <Tooltip />
              <Bar dataKey="recompute" fill="#ffbf5f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="chart-shell h-72">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-300">Memory usage over time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memoryTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" />
              <XAxis dataKey="name" stroke="#97a6c7" />
              <YAxis stroke="#97a6c7" />
              <Tooltip />
              <Line type="monotone" dataKey="memory" stroke="#4e93ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-shell h-72">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-300">Latency vs hit rate</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" />
              <XAxis type="number" dataKey="hitRate" unit="%" domain={[0, 100]} />
              <YAxis type="number" dataKey="latency" />
              <Tooltip />
              <Scatter name="Policies" data={comparisonData} fill="#55f6d9" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}