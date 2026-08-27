import SectionCard from "./SectionCard.jsx";
import { human, langColor } from "../../lib/data.js";

// Velocity (★/h) vs total size (stars). X is log-scaled so the long tail of
// small repos stays readable next to the giants.
export default function ScatterPlot({ repos = [] }) {
  const pts = repos.filter((r) => r.stars > 0 && r.momentum > 0);
  const maxMo = Math.max(...pts.map((r) => r.momentum), 1);
  const logMax = Math.log10(Math.max(...pts.map((r) => r.stars), 10));
  const leader = pts.reduce((a, b) => (b.momentum > (a?.momentum ?? 0) ? b : a), null);
  const scatterLabel = pts.length
    ? `Scatter plot of ${pts.length} repositories plotting velocity in stars per hour against total stars on a log scale. Fastest mover: ${leader.full_name} at ${human(leader.momentum)} stars per hour.`
    : "Scatter plot: no repositories with measurable velocity yet.";

  return (
    <SectionCard title="Velocity vs. total size" subtitle="★/hour against total stars (log scale)" className="h-[500px] flex flex-col">
      <div className="flex-1 border-l border-b border-border-dark relative mt-2 ml-8 mb-8" role="img" aria-label={scatterLabel}>
        <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-right font-mono-metrics text-[10px] text-text-muted-dark pb-2 pr-2">
          <span>{human(maxMo)}</span><span>{human(maxMo / 2)}</span><span>0</span>
        </div>
        <div className="absolute -bottom-6 left-0 w-full flex justify-between font-mono-metrics text-[10px] text-text-muted-dark">
          <span>10</span><span>100</span><span>1k</span><span>10k</span><span>100k+</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-border-dark opacity-30" />)}
        </div>
        {pts.map((r) => {
          const x = (Math.log10(Math.max(r.stars, 10)) / logMax) * 100;
          const y = 100 - (r.momentum / maxMo) * 100;
          const size = r.emerging ? 14 : 9;
          return (
            <div
              key={r.full_name}
              className="absolute rounded-full border border-surface cursor-pointer group"
              style={{
                left: `calc(${Math.min(x, 97)}% - ${size / 2}px)`,
                top: `calc(${Math.max(Math.min(y, 97), 2)}% - ${size / 2}px)`,
                width: size, height: size,
                background: r.emerging ? "#6e8bff" : langColor(r.language),
                boxShadow: r.emerging ? "0 0 12px rgba(110,139,255,0.7)" : "none",
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container-high border border-border-dark px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <p className="font-bold text-on-surface">{r.full_name}</p>
                <p className="text-text-muted-dark font-mono-metrics">{human(r.momentum)} ★/hr · {human(r.stars)} stars</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
