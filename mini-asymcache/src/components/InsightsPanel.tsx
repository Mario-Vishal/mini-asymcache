export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <div>
      <h2 className="section-title">Insights</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-100">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}
