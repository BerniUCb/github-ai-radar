import { useId } from "react";
import { TrendingUp } from "lucide-react";
import { human } from "../../lib/data.js";
import { scale, linePath } from "../../lib/chart.js";
import { BRAND } from "../../lib/colors.js";
import { useRepoDetail } from "../../lib/repoDetail.js";

function MiniSpark({ data }) {
  // Three cards render this, so the gradient id must be unique per instance.
  const id = `podium${useId().replace(/:/g, "")}`;
  if (!data || data.length < 2) return null;
  const pts = scale(data, 100, 40, { padTop: 4, padBottom: 4 });
  return (
    <svg className="w-24 h-12" viewBox="0 0 100 40" fill="none" aria-hidden="true">
      <path d={linePath(pts)} stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BRAND.accentLight} />
          <stop offset="100%" stopColor={BRAND.secondaryContainer} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Podium({ repos = [] }) {
  const openRepo = useRepoDetail();
  const top3 = repos.slice(0, 3);
  const rankColor = ["text-tertiary", "text-on-surface-variant", "text-tertiary-container"];

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
            <span className="font-label-caps text-label-caps text-text-muted-dark flex items-center gap-1">
              <TrendingUp size={14} className="text-secondary" /> Trending
            </span>
          </div>
          <button type="button" onClick={() => openRepo(r)} className="font-headline-md text-headline-md text-text-primary-dark mb-1 truncate block w-full text-left hover:text-primary">{r.full_name}</button>
          <p className="font-body-sm text-body-sm text-text-muted-dark mb-lg truncate">{r.description || "—"}</p>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-text-muted-dark mb-1">Velocity</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-metrics text-headline-lg text-primary">{human(r.momentum)}</span>
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
