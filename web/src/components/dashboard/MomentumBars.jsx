import SectionCard from "./SectionCard.jsx";

export default function MomentumBars({ items = [] }) {
  return (
    <SectionCard
      title="Top momentum"
      actions={<span className="font-label-caps text-label-caps text-text-muted-dark bg-surface-container px-sm py-xs rounded">★ per hour</span>}
      className="flex flex-col"
    >
      <div className="flex-1 flex flex-col justify-between gap-md">
        {items.map((b) => (
          <div key={b.full_name} className="flex items-center gap-md">
            <span className="w-28 text-sm font-mono-metrics text-on-surface-variant truncate" title={b.full_name}>{b.short}</span>
            <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary"
                style={{ width: `${b.pct}%` }}
              />
            </div>
            <span className="w-14 text-right text-sm font-mono-metrics text-text-primary-dark">{b.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
