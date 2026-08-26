import { Rocket, Flame, Sparkles, Activity } from "lucide-react";
import { human } from "../../lib/data.js";

const ICONS = {
  surge: { Icon: Rocket, wrap: "bg-primary-container/20 border-primary-container/50", color: "text-accent-light" },
  milestone: { Icon: Flame, wrap: "bg-error-coral/20 border-error-coral/50", color: "text-error-coral" },
  new: { Icon: Sparkles, wrap: "bg-surface-tint/20 border-surface-tint/50", color: "text-surface-tint" },
  default: { Icon: Activity, wrap: "bg-surface-variant border-border-dark", color: "text-text-muted-dark" },
};

export default function LiveMoversFeed({ movers = [] }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl flex flex-col h-[500px]">
      <div className="p-lg border-b border-border-dark flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-text-primary-dark">Live movers feed</h2>
        <Activity size={18} className="text-secondary live-dot" />
      </div>
      <div className="flex-1 overflow-y-auto p-xs">
        {movers.map((m, i) => {
          const { Icon, wrap, color } = ICONS[m.kind] || ICONS.default;
          return (
            <div key={i} className="p-sm mb-xs rounded-lg hover:bg-surface-variant transition-colors border border-transparent hover:border-border-dark">
              <div className="flex items-start gap-sm">
                <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 mt-1 ${wrap}`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1">
                  <p className="font-body-sm text-body-sm text-on-surface mb-1">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">{m.full_name}</a>{" "}
                    {m.kind === "milestone" ? (
                      <>crossed <span className="font-mono-metrics text-tertiary">{human(m.threshold)}</span> stars</>
                    ) : (
                      <>gained <span className="font-mono-metrics text-secondary">{human(m.gained)}</span> stars since last run</>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-label-caps bg-surface-container-high border border-border-dark text-text-muted-dark uppercase">{m.topic}</span>
                    <span className="font-mono-metrics text-[10px] text-text-muted-dark">{human(m.momentum)} ★/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {movers.length === 0 && <p className="text-center text-text-muted-dark py-10 font-label-caps text-label-caps">No recent movers.</p>}
      </div>
    </div>
  );
}
