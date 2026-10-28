import { useMemo, useState } from "react";
import DataTable from "./ui/DataTable.jsx";
import FilterChips from "./ui/FilterChips.jsx";
import SearchInput from "./ui/SearchInput.jsx";
import { human, langColor } from "../../lib/data.js";

// Columns that sort A→Z first; every other column sorts high→low first.
const TEXT_SORT = new Set(["full_name", "topic"]);

const GAINED_HINT = "Stars gained since the previous snapshot";
const MOMENTUM_HINT = "New stars per hour since the previous snapshot";
const STATUS_HINT = "Emerging = 5+ ★/h with 50+ total stars; otherwise Steady";

export default function EmergingTable({ repos = [], topics = [] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  // Opens on emerging repos only, so the table matches its title. "All" shows
  // the steady ones too.
  const [status, setStatus] = useState("emerging");
  // Default order matches the incoming ranking (momentum desc); null = unsorted.
  const [sort, setSort] = useState({ key: null, dir: "desc" });

  const maxMo = useMemo(() => Math.max(...repos.map((r) => r.momentum), 1), [repos]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = repos.filter(
      (r) =>
        (status === "all" || r.emerging) &&
        (topic === "all" || r.topic === topic) &&
        (q === "" || `${r.full_name} ${r.description || ""}`.toLowerCase().includes(q))
    );
    if (!sort.key) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (TEXT_SORT.has(sort.key)) {
        const av = String(a[sort.key] || "").toLowerCase();
        const bv = String(b[sort.key] || "").toLowerCase();
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const av = Number(a[sort.key]) || 0;
      const bv = Number(b[sort.key]) || 0;
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [repos, query, status, topic, sort]);

  // First click on a column: text sorts A→Z, numbers high→low. Re-click flips.
  function toggleSort(key) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: TEXT_SORT.has(key) ? "asc" : "desc" }
    );
  }

  const columns = [
    {
      key: "rank",
      label: "Rank",
      align: "center",
      sortable: true,
      cell: (r) => <span className="font-mono-metrics text-text-muted-dark">{String(r.rank).padStart(2, "0")}</span>,
    },
    {
      key: "full_name",
      label: "Repository",
      sortable: true,
      cell: (r) => (
        <>
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary group-hover:underline">
            {r.full_name}
          </a>
          <div className="text-body-xs text-text-muted-dark truncate max-w-xs mt-0.5">{r.description}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: langColor(r.language) }} aria-hidden="true" />
            <span className="font-label-caps text-label-caps text-text-muted-dark">{r.language || "—"}</span>
          </div>
        </>
      ),
    },
    {
      key: "topic",
      label: "Topic",
      sortable: true,
      cell: (r) => (
        <span className="px-2 py-0.5 rounded bg-surface-container border border-border-dark font-label-caps text-label-caps text-text-muted-dark">
          {r.topic}
        </span>
      ),
    },
    {
      key: "stars",
      label: "Stars",
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-mono-metrics text-text-primary-dark">{human(r.stars)}</span>,
    },
    {
      key: "gained",
      label: "Gained",
      align: "right",
      sortable: true,
      hint: GAINED_HINT,
      cell: (r) => <span className="font-mono-metrics text-secondary">+{human(r.gained)}</span>,
    },
    {
      key: "momentum",
      label: "Momentum",
      align: "right",
      sortable: true,
      hint: MOMENTUM_HINT,
      cell: (r) => (
        <div className="flex items-center gap-3 justify-end">
          <span className="text-body-xs font-mono-metrics text-text-muted-dark whitespace-nowrap">{human(r.momentum)} ★/h</span>
          <div className="h-1.5 w-16 bg-border-dark rounded-full overflow-hidden" aria-hidden="true">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary"
              style={{ width: `${Math.max(4, (r.momentum / maxMo) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "emerging",
      label: "Status",
      align: "center",
      sortable: true,
      hint: STATUS_HINT,
      cell: (r) =>
        r.emerging ? (
          <span
            title="Gaining 5+ ★/h with 50+ total stars"
            className="cursor-help px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-caps text-label-caps border border-primary-container/30 shadow-[0_0_8px_rgba(110,139,255,0.2)]"
          >
            Emerging
          </span>
        ) : (
          <span
            title="Below the emerging threshold (5+ ★/h with 50+ stars)"
            className="cursor-help inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-muted-dark font-label-caps text-label-caps"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-outline" aria-hidden="true" />
            Steady
          </span>
        ),
    },
  ];

  const statusOptions = [
    { value: "emerging", label: "Emerging only" },
    { value: "all", label: "All repos" },
  ];
  const topicOptions = [{ value: "all", label: "All" }, ...topics.map((t) => ({ value: t.name, label: t.name }))];

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl flex flex-col overflow-hidden">
      <div className="p-lg border-b border-border-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-text-primary-dark">Emerging repositories</h2>
          <p className="font-body-sm text-body-sm text-text-muted-dark mt-1">Emerging = gaining 5+ ★/h with 50+ total stars.</p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto md:max-w-md min-w-0">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search repos…"
            label="Search emerging repositories"
            className="md:w-72"
          />
          <FilterChips label="Show" options={statusOptions} value={status} onChange={setStatus} />
          <FilterChips label="Filter by topic" options={topicOptions} value={topic} onChange={setTopic} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        sort={sort}
        onSort={toggleSort}
        rowKey={(r) => r.full_name}
        minWidth={820}
        empty="No repos match your filters."
      />
    </div>
  );
}
