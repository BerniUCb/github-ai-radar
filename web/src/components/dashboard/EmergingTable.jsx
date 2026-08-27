import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { human, langColor } from "../../lib/data.js";

// Plain-language definitions for the coined metrics, shown as column tooltips.
const COL_HINTS = {
  Gained: "Stars gained since the previous snapshot",
  Momentum: "New stars per hour since the previous snapshot",
  Status: "Emerging = 5+ ★/h with 50+ total stars; otherwise Steady",
};

export default function EmergingTable({ repos = [], topics = [] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");

  const maxMo = useMemo(() => Math.max(...repos.map((r) => r.momentum), 1), [repos]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter(
      (r) =>
        (topic === "all" || r.topic === topic) &&
        (q === "" || `${r.full_name} ${r.description || ""}`.toLowerCase().includes(q))
    );
  }, [repos, query, topic, maxMo]);

  const chips = ["all", ...topics.map((t) => t.name)];

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl flex flex-col overflow-hidden">
      <div className="p-lg border-b border-border-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-text-primary-dark">Emerging repositories</h2>
          <p className="font-body-sm text-body-sm text-text-muted-dark mt-1">Emerging = gaining 5+ ★/h with 50+ total stars.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repos…"
              className="w-full bg-surface-container border border-border-dark rounded-lg py-1.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setTopic(c)}
                className={`px-3 py-1 rounded-full border text-xs font-label-caps whitespace-nowrap transition-colors ${
                  topic === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-dark text-text-muted-dark hover:border-outline-variant"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-border-dark bg-surface-container-low">
              {["Rank", "Repository", "Topic", "Stars", "Gained", "Momentum", "Status"].map((h, i) => (
                <th key={h} title={COL_HINTS[h]} className={`py-3 px-md font-label-caps text-label-caps text-text-muted-dark ${COL_HINTS[h] ? "cursor-help" : ""} ${i >= 3 && i <= 4 ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/60 font-body-sm text-body-sm">
            {rows.map((r) => (
              <tr key={r.full_name} className="group hover:bg-surface-container/50 transition-colors">
                <td className="py-4 px-md font-mono-metrics text-text-muted-dark text-center">{String(r.rank).padStart(2, "0")}</td>
                <td className="py-4 px-md">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary group-hover:underline">{r.full_name}</a>
                  <div className="text-xs text-text-muted-dark truncate max-w-xs mt-0.5">{r.description}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: langColor(r.language) }} />
                    <span className="text-[10px] font-label-caps text-text-muted-dark">{r.language || "—"}</span>
                  </div>
                </td>
                <td className="py-4 px-md"><span className="px-2 py-0.5 rounded bg-surface-container border border-border-dark text-[10px] font-label-caps text-text-muted-dark">{r.topic}</span></td>
                <td className="py-4 px-md font-mono-metrics text-right text-text-primary-dark">{human(r.stars)}</td>
                <td className="py-4 px-md font-mono-metrics text-right text-secondary">+{human(r.gained)}</td>
                <td className="py-4 px-md">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-xs font-mono-metrics text-text-muted-dark whitespace-nowrap">{human(r.momentum)} ★/h</span>
                    <div className="h-1.5 w-16 bg-border-dark rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary" style={{ width: `${Math.max(4, (r.momentum / maxMo) * 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-md text-center">
                  {r.emerging ? (
                    <span title="Gaining 5+ ★/h with 50+ total stars" className="cursor-help px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container text-[10px] font-label-caps border border-primary-container/30 shadow-[0_0_8px_rgba(110,139,255,0.2)]">Emerging</span>
                  ) : (
                    <span title="Below the emerging threshold (5+ ★/h with 50+ stars)" className="cursor-help inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-muted-dark text-[10px] font-label-caps"><span className="w-1.5 h-1.5 rounded-full bg-outline" aria-hidden="true" />Steady</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-text-muted-dark">No repos match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
