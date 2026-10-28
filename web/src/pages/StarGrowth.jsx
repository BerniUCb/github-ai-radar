import { useOutletContext } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import SectionCard from "../components/dashboard/SectionCard.jsx";
import MultiLineChart from "../components/dashboard/MultiLineChart.jsx";
import DataTable from "../components/dashboard/ui/DataTable.jsx";
import { human } from "../lib/data.js";
import { CHART_PALETTE as DOT } from "../lib/colors.js";

export default function StarGrowth() {
  const data = useOutletContext();
  const growth = data.growth || { series: [] };
  const cards = growth.series.slice(0, 3);

  const maxVel = Math.max(...growth.series.map((x) => x.velocity || 0), 1);
  const colorOf = (s) => DOT[growth.series.indexOf(s) % DOT.length];

  const velocityColumns = [
    {
      key: "name",
      label: "Repository",
      primary: true,
      cell: (s) => (
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorOf(s) }} aria-hidden="true" />
          <span className="font-body-md text-body-md break-words min-w-0">{s.full_name}</span>
        </span>
      ),
    },
    {
      key: "total",
      label: "Total stars",
      align: "right",
      cell: (s) => <span className="font-mono-metrics text-text-muted-dark">{human(s.last)}</span>,
    },
    {
      key: "velocity",
      label: "Velocity (stars/day)",
      align: "right",
      cell: (s) => (
        <span className="flex items-center justify-end gap-2 font-mono-metrics text-mono-metrics">
          <span>{human(s.velocity)}</span>
          <span className="w-16 h-1 bg-surface-variant rounded-full overflow-hidden" aria-hidden="true">
            <span className="block h-full" style={{ width: `${((s.velocity || 0) / maxVel) * 100}%`, background: colorOf(s) }} />
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-gutter">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Star Growth Analysis</h1>
        <p className="font-body-md text-body-md text-text-muted-dark mt-1">Trajectories of the fastest-moving repos over the tracked window.</p>
      </div>

      <SectionCard title="Growth since start of window" subtitle="Each repo indexed to its own starting stars — hover for detail" className="bg-surface-container-lowest">
        <MultiLineChart series={growth.series} labels={growth.labels} />
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {cards.map((s, i) => (
          <div key={s.full_name} className="bg-surface-container-low border border-border-dark rounded-xl p-lg relative overflow-hidden group hover:border-outline-variant transition-colors">
            <div className="font-label-caps text-label-caps text-text-muted-dark mb-1 flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOT[i % DOT.length] }} />
              <span className="break-words min-w-0">{s.full_name}</span>
            </div>
            <div className="font-mono-metrics text-headline-lg text-on-surface my-2">{human(s.last)}</div>
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
        <DataTable
          columns={velocityColumns}
          rows={growth.series}
          rowKey={(s) => s.full_name}
          minWidth={560}
          empty="No velocity data yet."
        />
      </SectionCard>
    </div>
  );
}
