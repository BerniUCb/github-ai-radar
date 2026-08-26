import { scale, linePath } from "../../lib/chart.js";
import { human } from "../../lib/data.js";

const SERIES_COLORS = ["#6e8bff", "#42e1b3", "#b7c4ff", "#ffb960", "#FF6B7D"];

export default function MultiLineChart({ series = [] }) {
  const clean = series.filter((s) => s.values && s.values.length >= 2);
  if (!clean.length) {
    return <div className="h-80 flex items-center justify-center text-text-muted-dark font-label-caps text-label-caps">Not enough history yet — check back after a few runs.</div>;
  }

  const W = 1000, H = 300;
  const allVals = clean.flatMap((s) => s.values);
  const max = Math.max(...allVals, 1);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {clean.map((s, i) => (
          <div key={s.full_name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <span className="font-label-caps text-label-caps text-text-muted-dark">{s.full_name}</span>
          </div>
        ))}
      </div>
      <div className="h-80 w-full relative">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono-metrics text-text-muted-dark pointer-events-none pb-6">
          <span>{human(max)}</span><span>{human(max / 2)}</span><span>0</span>
        </div>
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="#262B38" strokeDasharray="4" opacity="0.5" />
          ))}
          {clean.map((s, i) => {
            const pts = scale(s.values, W, H, { padTop: 10, padBottom: 10, min: 0, max });
            return <path key={s.full_name} d={linePath(pts)} fill="none" stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
          })}
        </svg>
      </div>
    </div>
  );
}
