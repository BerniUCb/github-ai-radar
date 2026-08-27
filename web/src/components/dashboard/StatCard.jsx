import Sparkline from "./Sparkline.jsx";
import { BRAND } from "../../lib/colors.js";

export default function StatCard({ label, value, unit, sub, spark, icon: Icon, accent = false }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-lg flex flex-col justify-between hover:border-outline-variant transition-colors group relative overflow-hidden">
      <div className="flex justify-between items-start mb-md">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={18} className="text-outline" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-headline-lg text-headline-lg font-mono-metrics ${accent ? "text-primary-container" : "text-text-primary-dark"}`}>{value}</span>
        {unit && <span className="font-mono-metrics text-body-sm text-text-muted-dark">{unit}</span>}
      </div>
      {sub && <div className="font-body-sm text-body-sm text-text-muted-dark mt-xs truncate">{sub}</div>}
      {spark && (
        <div className="mt-md opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={spark} color={accent ? BRAND.primaryContainer : BRAND.secondary} />
        </div>
      )}
    </div>
  );
}
