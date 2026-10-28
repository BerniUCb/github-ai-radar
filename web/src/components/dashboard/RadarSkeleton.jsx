// Placeholder shaped like the Overview page, so the layout doesn't jump when the
// data arrives. The text is for screen readers; the blocks are hidden from them.
export default function RadarSkeleton() {
  const pulse = "bg-surface-container animate-pulse motion-reduce:animate-none";

  return (
    <div className="max-w-7xl mx-auto space-y-xl">
      <span className="sr-only" role="status">Loading radar…</span>

      <div className="space-y-md" aria-hidden="true">
        <div className={`h-10 w-2/3 max-w-md rounded-lg ${pulse}`} />
        <div className={`h-5 w-full max-w-2xl rounded ${pulse}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-40 rounded-xl border border-border-dark ${pulse}`} />
        ))}
      </div>

      <div className={`h-80 rounded-xl border border-border-dark ${pulse}`} aria-hidden="true" />
    </div>
  );
}
