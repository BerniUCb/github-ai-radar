import { useOutletContext } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import SectionCard from "../components/dashboard/SectionCard.jsx";
import MultiLineChart from "../components/dashboard/MultiLineChart.jsx";
import { human } from "../lib/data.js";

const DOT = ["#6e8bff", "#42e1b3", "#b7c4ff", "#ffb960", "#FF6B7D"];

export default function StarGrowth() {
  const data = useOutletContext();
  const growth = data.growth || { series: [] };
  const cards = growth.series.slice(0, 3);

  return (
    <div className="space-y-gutter">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Star Growth Analysis</h1>
        <p className="font-body-md text-body-md text-text-muted-dark mt-1">Trajectories of the fastest-moving repos over the tracked window.</p>
      </div>

      <SectionCard title="Stars accumulated over time" className="bg-surface-container-lowest">
        <MultiLineChart series={growth.series} />
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {cards.map((s, i) => (
          <div key={s.full_name} className="bg-surface-container-low border border-border-dark rounded-xl p-lg relative overflow-hidden group hover:border-outline-variant transition-colors">
            <div className="font-label-caps text-label-caps text-text-muted-dark mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: DOT[i % DOT.length] }} />{s.full_name}
            </div>
            <div className="font-mono-metrics text-display-lg text-on-surface my-2">{human(s.last)}</div>
            <div className="flex items-center gap-2 font-mono-metrics text-sm">
              <span className="text-secondary flex items-center bg-secondary/10 px-2 py-0.5 rounded text-xs">
                <TrendingUp size={14} className="mr-1" /> {s.growth_pct != null ? `+${s.growth_pct}%` : "—"}
              </span>
              <span className="text-text-muted-dark text-xs">window growth</span>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Velocity ranking" subtitle="Recent stars per day" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-border-dark bg-surface-container-highest font-label-caps text-label-caps text-text-muted-dark">
                <th className="py-3 px-6 font-medium">Repository</th>
                <th className="py-3 px-6 font-medium text-right">Total stars</th>
                <th className="py-3 px-6 font-medium text-right">Velocity (stars/day)</th>
              </tr>
            </thead>
            <tbody className="font-mono-metrics text-mono-metrics text-on-surface">
              {growth.series.map((s, i) => {
                const maxVel = Math.max(...growth.series.map((x) => x.velocity || 0), 1);
                return (
                  <tr key={s.full_name} className="border-b border-border-dark hover:bg-surface-variant/30 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: DOT[i % DOT.length] }} />
                      <span className="font-body-md text-body-md">{s.full_name}</span>
                    </td>
                    <td className="py-4 px-6 text-right text-text-muted-dark">{human(s.last)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{human(s.velocity)}</span>
                        <div className="w-16 h-1 bg-surface-variant rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: `${((s.velocity || 0) / maxVel) * 100}%`, background: DOT[i % DOT.length] }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
