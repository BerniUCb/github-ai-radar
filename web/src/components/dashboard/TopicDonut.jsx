import SectionCard from "./SectionCard.jsx";
import { human } from "../../lib/data.js";

const COLORS = ["#6e8bff", "#42e1b3", "#b7c4ff", "#00c599", "#3edeb1", "#8e909f", "#3554c6"];
const R = 40;
const C = 2 * Math.PI * R;

export default function TopicDonut({ topics = [], total }) {
  const sum = (total ?? topics.reduce((s, t) => s + t.count, 0)) || 1;
  let offset = 0;
  const segments = topics.map((t, i) => {
    const dash = (t.count / sum) * C;
    const seg = { ...t, color: COLORS[i % COLORS.length], dash, offset: -offset };
    offset += dash;
    return seg;
  });

  return (
    <SectionCard title="Repos by topic" className="flex flex-col">
      <div className="flex items-center justify-center gap-lg flex-1">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="transparent" stroke="#1e1f26" strokeWidth="14" />
            {segments.map((s) => (
              <circle
                key={s.name}
                cx="50" cy="50" r={R} fill="transparent"
                stroke={s.color} strokeWidth="14"
                strokeDasharray={`${s.dash.toFixed(2)} ${(C - s.dash).toFixed(2)}`}
                strokeDashoffset={s.offset.toFixed(2)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-metrics text-headline-md text-text-primary-dark">{human(sum)}</span>
            <span className="font-label-caps text-label-caps text-text-muted-dark">repos</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-md gap-y-xs justify-center mt-md">
        {segments.map((s) => (
          <span key={s.name} className="flex items-center gap-xs font-label-caps text-label-caps text-text-muted-dark">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name} <span className="text-text-primary-dark">{s.count}</span>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
