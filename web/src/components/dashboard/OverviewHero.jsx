import { ArrowUpRight, Star } from "lucide-react";
import Sparkline from "./Sparkline.jsx";
import { human, langColor } from "../../lib/data.js";
import { BRAND } from "../../lib/colors.js";

// Editorial lead for the Overview: instead of four equal KPI cards, the page
// opens on its actual story — the repo climbing fastest right now — with its
// live star signal, and the remaining metrics as a quiet ledger beside it.
function LedgerStat({ label, value, sub, spark, accent = false }) {
  return (
    <div className="py-md first:pt-0 flex items-center justify-between gap-md">
      <div className="min-w-0">
        <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{label}</div>
        {sub && <div className="font-body-sm text-body-sm text-text-muted-dark mt-0.5 truncate">{sub}</div>}
      </div>
      <div className="flex items-center gap-md shrink-0">
        {spark && <div className="w-16 opacity-70"><Sparkline data={spark} height={22} color={accent ? BRAND.primaryContainer : BRAND.secondary} /></div>}
        <span className={`font-mono-metrics text-headline-md tabular-nums ${accent ? "text-primary-container" : "text-text-primary-dark"}`}>{value}</span>
      </div>
    </div>
  );
}

export default function OverviewHero({ kpis: k, feature, topicCount }) {
  return (
    <section className="border-b border-border-dark pb-xl">
      <h1 className="font-display-lg text-display-lg text-text-primary-dark tracking-tight leading-none">On the radar</h1>
      <p className="mt-md font-body-lg text-body-lg text-text-muted-dark max-w-2xl">
        {human(k.repos_tracked)} AI repositories across {topicCount} topics, ranked by the stars they are gaining right now.
      </p>

      <div className="mt-xl grid grid-cols-1 lg:grid-cols-5 gap-x-xl gap-y-lg">
        {/* Feature: the fastest riser, with its live star signal */}
        {feature && (
          <a href={feature.url} target="_blank" rel="noopener noreferrer" className="lg:col-span-3 group flex flex-col">
            <div className="flex items-baseline gap-sm">
              <span className="font-mono-metrics text-[68px] leading-none tabular-nums text-secondary">{human(feature.momentum)}</span>
              <span className="font-mono-metrics text-body-lg text-secondary-container">★/h</span>
              <span className="font-label-caps text-label-caps text-text-muted-dark uppercase tracking-wider ml-1">fastest riser</span>
            </div>
            <h2 className="mt-md font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
              {feature.full_name}
              <ArrowUpRight size={20} className="text-outline group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" aria-hidden="true" />
            </h2>
            {feature.description && (
              <p className="mt-xs font-body-md text-body-md text-text-muted-dark max-w-xl line-clamp-2">{feature.description}</p>
            )}

            {/* The star signal: this repo's own trajectory over the window. */}
            {feature.spark && (
              <div className="mt-lg -mx-1">
                <Sparkline data={feature.spark} height={56} color={BRAND.secondary} />
              </div>
            )}

            <div className="mt-md flex flex-wrap items-center gap-md font-label-caps text-label-caps text-text-muted-dark">
              <span className="px-2 py-0.5 rounded bg-surface-container border border-border-dark">{feature.topic}</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: langColor(feature.language) }} aria-hidden="true" />
                {feature.language || "—"}
              </span>
              <span className="flex items-center gap-1 tabular-nums"><Star size={12} aria-hidden="true" /> {human(feature.stars)}</span>
              <span className="tabular-nums text-secondary">+{human(feature.gained)} this run</span>
            </div>
          </a>
        )}

        {/* Ledger: supporting signals, hairline-separated, each with its trend */}
        <dl className="lg:col-span-2 flex flex-col justify-center divide-y divide-border-dark border-t border-border-dark">
          <LedgerStat label="Emerging now" value={k.emerging_now} sub="breaking growth thresholds" accent />
          <LedgerStat label="Repos tracked" value={human(k.repos_tracked)} sub={`across ${topicCount} AI topics`} />
          <LedgerStat label="Stars gained" value={human(k.stars_gained)} sub="since previous snapshot" />
        </dl>
      </div>
    </section>
  );
}
