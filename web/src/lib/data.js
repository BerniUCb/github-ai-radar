// Loads the dataset the Python pipeline writes to `data.json` and exposes a few
// formatting helpers shared across the dashboard.

import { useEffect, useState } from "react";

export function useRadarData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`data.json ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(setError);
  }, []);

  return { data, error };
}

/** 45230 -> "45.2k", 1_200_000 -> "1.2M". */
export function human(n) {
  if (n == null) return "0";
  n = Number(n);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`.replace(".0M", "M");
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`.replace(".0k", "k");
  // Values under 10 keep one decimal so slow risers don't read as 0.
  if (Math.abs(n) < 10 && !Number.isInteger(n)) return n.toFixed(1);
  return `${Math.round(n)}`;
}

export const LANG_COLORS = {
  Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", Rust: "#dea584",
  Go: "#00ADD8", "C++": "#f34b7d", C: "#555555", "Jupyter Notebook": "#DA5B0B",
  Java: "#b07219", Shell: "#89e051", HTML: "#e34c26", Ruby: "#701516",
  Swift: "#F05138", Kotlin: "#A97BFF",
};

export function langColor(lang) {
  return LANG_COLORS[lang] || "#8A92A6";
}

// The radar runs on a cron every 6 hours (see .github/workflows/radar.yml).
const RUN_EVERY_MS = 6 * 60 * 60 * 1000;

/** "2026-08-26 03:45 UTC" -> Date, or null when it can't be read. */
export function parseUpdated(s) {
  if (!s) return null;
  const d = new Date(s.replace(" UTC", "Z").replace(" ", "T"));
  return isNaN(d) ? null : d;
}

/** Age of the data and time until the next scheduled run. `stale` means two
 *  runs have been missed, so the numbers may no longer be current. */
export function freshness(lastUpdated, now = Date.now()) {
  const updated = parseUpdated(lastUpdated);
  if (!updated) return null;
  const age = now - updated.getTime();
  const nextRun = Math.ceil(now / RUN_EVERY_MS) * RUN_EVERY_MS;
  return { age, untilNext: nextRun - now, stale: age > 2 * RUN_EVERY_MS };
}

/** 150_000 -> "2 min ago", 7_200_000 -> "2 h ago". */
export function formatAgo(ms) {
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/** Time until the next run: "in 40 min", "in 4 h". */
export function formatIn(ms) {
  const mins = Math.max(1, Math.round(ms / 60_000));
  if (mins < 60) return `in ${mins} min`;
  return `in ${Math.round(mins / 60)} h`;
}
