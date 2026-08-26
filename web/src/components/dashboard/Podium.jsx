import { TrendingUp } from "lucide-react";
import { human } from "../../lib/data.js";
import { scale, linePath } from "../../lib/chart.js";

function MiniSpark({ data }) {
  if (!data || data.length < 2) return null;
  const pts = scale(data, 100, 40, { padTop: 4, padBottom: 4 });
  return (
    <svg className="w-24 h-12" viewBox="0 0 100 40" fill="none">
      <path d={linePath(pts)} stroke="url(#podiumGrad)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#00c599" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Podium({ repos = [] }) {
  const top3 = repos.slice(0, 3);
  const rankColor = ["text-tertiary", "text-on-surface-variant", "text-[#cd8200]"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      {top3.map((r, i) => (
        <div
          key={r.full_name}
          className={`bg-surface-dark rounded-xl p-lg relative overflow-hidden group transition-colors ${
            i === 0 ? "border border-accent-light/30 hover:border-accent-light/60" : "border border-border-dark hover:border-outline-variant"
          }`}
        >
          {i === 0 && <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent-light/10 blur-2xl rounded-full" />}
          <div className="flex justify-between items-start mb-md">
            <div className={`w-10 h-10 rounded-lg bg-surface-variant border border-border-dark flex items-center justify-center font-headline-md text-headline-md font-bold ${rankColor[i]}`}>
              {i + 1}
            </div>
            <span className="font-label-caps text-label-caps text-text-muted-dark uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={14} className="text-secondary" /> Trending
            </span>
          </div>
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-headline-md text-headline-md text-text-primary-dark mb-1 truncate block hover:text-primary">{r.full_name}</a>
          <p className="font-body-sm text-body-sm text-text-muted-dark mb-lg truncate">{r.description || "—"}</p>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-text-muted-dark mb-1 uppercase">Velocity</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-metrics text-display-lg text-primary">{human(r.momentum)}</span>
                <span className="font-mono-metrics text-body-sm text-text-muted-dark">★/hr</span>
              </div>
            </div>
            <MiniSpark data={r.spark} />
          </div>
        </div>
      ))}
    </div>
  );
}
