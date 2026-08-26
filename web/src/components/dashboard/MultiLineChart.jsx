import InteractiveChart from "./InteractiveChart.jsx";

const COLORS = ["#6e8bff", "#42e1b3", "#b7c4ff", "#ffb960", "#FF6B7D"];

// Star-growth chart: normalises every repo to percent growth from its own start
// (mode="index") so a 200k-star giant and a 600-star newcomer are comparable.
export default function MultiLineChart({ series = [], labels = [] }) {
  const prepared = series
    .filter((s) => s.values && s.values.length >= 2)
    .map((s, i) => ({ name: s.full_name, values: s.values, color: COLORS[i % COLORS.length] }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {prepared.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="font-label-caps text-label-caps text-text-muted-dark">{s.name}</span>
          </div>
        ))}
        <span className="ml-auto font-label-caps text-label-caps text-text-muted-dark">% growth from start of window</span>
      </div>
      <div className="pl-12">
        <InteractiveChart series={prepared} labels={labels} mode="index" height={320} unit="stars" />
      </div>
    </div>
  );
}
