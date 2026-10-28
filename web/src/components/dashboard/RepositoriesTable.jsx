import { useMemo, useState } from "react";
import { BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import DataTable from "./ui/DataTable.jsx";
import FilterChips from "./ui/FilterChips.jsx";
import SearchInput from "./ui/SearchInput.jsx";
import { useRepoDetail } from "../../lib/repoDetail.js";
import { human, langColor } from "../../lib/data.js";

const PAGE_SIZES = [10, 25, 50, 100];
const MOMENTUM_HINT = "New stars per hour since the previous snapshot";

const selectCls =
  "appearance-none bg-background-dark border border-border-dark rounded py-1.5 pl-3 pr-8 text-on-surface font-label-caps text-label-caps focus:outline-none focus:border-primary-container hover:border-outline-variant cursor-pointer";
const pageBtnCls =
  "w-8 h-8 rounded border border-border-dark bg-background-dark text-text-muted-dark hover:text-on-surface hover:border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center";

export default function RepositoriesTable({ repos = [] }) {
  const openRepo = useRepoDetail();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("all");
  const [topic, setTopic] = useState("all");
  const [sort, setSort] = useState({ key: "stars", dir: "desc" });
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);

  const languages = useMemo(() => [...new Set(repos.map((r) => r.language).filter(Boolean))].sort(), [repos]);
  const topics = useMemo(() => [...new Set(repos.map((r) => r.topic).filter(Boolean))].sort(), [repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = repos.filter(
      (r) =>
        (lang === "all" || r.language === lang) &&
        (topic === "all" || r.topic === topic) &&
        (q === "" || `${r.full_name} ${r.description || ""}`.toLowerCase().includes(q))
    );
    out.sort((a, b) => ((a[sort.key] || 0) - (b[sort.key] || 0)) * (sort.dir === "asc" ? 1 : -1));
    return out;
  }, [repos, query, lang, topic, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * perPage, current * perPage);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
    setPage(1);
  }

  const columns = [
    {
      key: "full_name",
      label: "Repository",
      primary: true,
      cell: (r) => (
        <div className="flex items-start gap-sm">
          <BookMarked size={16} className="text-text-muted-dark mt-1 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => openRepo(r)}
              className="font-semibold text-body-md text-primary text-left hover:underline break-words"
            >
              {r.full_name}
            </button>
            <p className="text-body-sm text-text-muted-dark mt-1 line-clamp-2 max-w-md">{r.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stars",
      label: "Stars",
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-mono-metrics text-on-surface">{human(r.stars)}</span>,
    },
    {
      key: "forks",
      label: "Forks",
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-mono-metrics text-text-muted-dark">{human(r.forks)}</span>,
    },
    {
      key: "momentum",
      label: "★/h",
      align: "right",
      sortable: true,
      hint: MOMENTUM_HINT,
      cell: (r) => <span className="font-mono-metrics text-secondary">{human(r.momentum)}</span>,
    },
    {
      key: "language",
      label: "Language",
      cell: (r) => (
        <div className="flex items-center gap-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: langColor(r.language) }} aria-hidden="true" />
          <span className="font-label-caps text-label-caps">{r.language || "—"}</span>
        </div>
      ),
    },
    {
      key: "license",
      label: "License",
      cell: (r) => <span className="text-text-muted-dark">{r.license || "—"}</span>,
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      footer: true,
      cell: (r) => (
        <button
          type="button"
          onClick={() => openRepo(r)}
          className="border border-border-dark hover:border-primary-container text-on-surface hover:text-primary bg-background-dark px-3 py-1 rounded font-label-caps text-label-caps font-semibold transition-all"
        >
          Details
        </button>
      ),
    },
  ];

  const hasFilters = lang !== "all" || topic !== "all" || query;
  const langOptions = [{ value: "all", label: "All" }, ...languages.map((l) => ({ value: l, label: l }))];
  const topicOptions = [{ value: "all", label: "All" }, ...topics.map((t) => ({ value: t, label: t }))];

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
      <div className="p-md flex flex-col gap-md border-b border-border-dark">
        <SearchInput
          value={query}
          onChange={(v) => { setQuery(v); setPage(1); }}
          placeholder="Search repositories by name, description, or topic…"
          label="Search repositories"
        />
        <div className="flex flex-col gap-sm">
          <FilterChips label="Filter by language" options={langOptions} value={lang} onChange={(v) => { setLang(v); setPage(1); }} />
          <FilterChips label="Filter by topic" options={topicOptions} value={topic} onChange={(v) => { setTopic(v); setPage(1); }} />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setLang("all"); setTopic("all"); setQuery(""); setPage(1); }}
            className="self-end font-label-caps text-label-caps text-text-muted-dark hover:text-on-surface transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={slice}
        sort={sort}
        onSort={toggleSort}
        rowKey={(r) => r.full_name}
        minWidth={860}
        empty="No repositories match your filters."
      />

      <div className="border-t border-border-dark p-md flex flex-col sm:flex-row items-center justify-between gap-md">
        <div className="flex items-center gap-xs text-text-muted-dark font-label-caps text-label-caps">
          Show
          <select className={selectCls} value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          per page · {filtered.length} repos
        </div>
        <div className="flex items-center gap-xs">
          <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)} className={pageBtnCls} aria-label="Previous page">
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono-metrics text-body-sm text-on-surface px-2">{current} / {pages}</span>
          <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)} className={pageBtnCls} aria-label="Next page">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
