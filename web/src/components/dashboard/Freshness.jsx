import { useEffect, useState } from "react";
import { freshness, formatAgo, formatIn } from "../../lib/data.js";

// States how old the numbers are and when they change next. The radar runs
// every 6 hours, so this shows that cadence instead of implying a live feed.
// `compact` drops the next-update part for the top bar.
export default function Freshness({ lastUpdated, compact = false }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const f = freshness(lastUpdated, now);
  if (!f) return null;

  if (f.stale) {
    return (
      <span className="inline-flex items-center gap-xs text-tertiary" title={`Data generated ${lastUpdated}`}>
        <span className="w-2 h-2 rounded-full bg-tertiary" aria-hidden="true" />
        Data may be outdated · last update {formatAgo(f.age)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-xs text-text-muted-dark" title={`Data generated ${lastUpdated}`}>
      <span className="w-2 h-2 rounded-full bg-secondary" aria-hidden="true" />
      Updated {formatAgo(f.age)}
      {!compact && <span>· next update {formatIn(f.untilNext)}</span>}
    </span>
  );
}
