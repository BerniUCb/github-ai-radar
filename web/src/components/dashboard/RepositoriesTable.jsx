import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, BookMarked } from "lucide-react";
import { human, langColor } from "../../lib/data.js";

const COLUMNS = [
  { key: "stars", label: "Stars" },
  { key: "forks", label: "Forks" },
  { key: "momentum", label: "★/h" },
];

export default function RepositoriesTable({ repos = [] }) {
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
  const sortIcon = (key) => (sort.key !== key ? <ArrowUpDown size={13} aria-hidden="true" /> : sort.dir === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />);

  const selectCls = "appearance-none bg-background-dark border border-border-dark rounded py-1.5 pl-3 pr-8 text-on-surface font-label-caps text-label-caps focus:outline-none focus:border-primary-container hover:border-outline-variant cursor-pointer";

  return (
    <div className="space-y-md">
      <div className="bg-surface-dark border border-border-dark rounded-lg p-md flex flex-col gap-md">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search repositories by name, description, or topic…"
            className="w-full bg-background-dark border border-border-dark rounded py-2 pl-11 pr-4 text-on-surface font-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container placeholder-text-muted-dark transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-sm pt-xs border-t border-border-dark">
          <select className={selectCls} value={lang} onChange={(e) => { setLang(e.target.value); setPage(1); }}>
            <option value="all">Language: All</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className={selectCls} value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }}>
            <option value="all">Topic: All</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(lang !== "all" || topic !== "all" || query) && (
            <button onClick={() => { setLang("all"); setTopic("all"); setQuery(""); setPage(1); }} className="ml-auto text-text-muted-dark hover:text-on-surface font-label-caps text-label-caps transition-colors">
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-dark border border-border-dark rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-surface-dim border-b border-border-dark">
                <th className="py-3 px-md font-label-caps text-label-caps text-text-muted-dark font-medium w-2/5">Repository</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className="py-0 px-0 font-label-caps text-label-caps text-text-muted-dark font-medium whitespace-nowrap text-right">
                    <button type="button" onClick={() => toggleSort(c.key)} title={`Sort by ${c.label}`} className="w-full py-3 px-md inline-flex items-center gap-xs justify-end hover:text-on-surface transition-colors">
                      {c.label} {sortIcon(c.key)}
                    </button>
                  </th>
                ))}
                <th className="py-3 px-md font-label-caps text-label-caps text-text-muted-dark font-medium">Language</th>
                <th className="py-3 px-md font-label-caps text-label-caps text-text-muted-dark font-medium">License</th>
                <th className="py-3 px-md font-label-caps text-label-caps text-text-muted-dark font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-border-dark">
              {slice.map((r) => (
                <tr key={r.full_name} className="hover:bg-surface-dim transition-colors group">
                  <td className="py-md px-md">
                    <div className="flex items-start gap-sm">
                      <BookMarked size={16} className="text-text-muted-dark mt-1 shrink-0" />
                      <div>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-headline-md text-[15px] font-semibold text-primary hover:underline flex items-center gap-xs">
                          {r.full_name}
                          <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <p className="text-text-muted-dark text-[13px] mt-1 line-clamp-2 max-w-md">{r.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-md font-mono-metrics text-right text-on-surface">{human(r.stars)}</td>
                  <td className="py-md px-md font-mono-metrics text-right text-text-muted-dark">{human(r.forks)}</td>
                  <td className="py-md px-md font-mono-metrics text-right text-secondary">{human(r.momentum)}</td>
                  <td className="py-md px-md">
                    <div className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: langColor(r.language) }} />
                      <span className="font-label-caps text-label-caps">{r.language || "—"}</span>
                    </div>
                  </td>
                  <td className="py-md px-md text-text-muted-dark">{r.license || "—"}</td>
                  <td className="py-md px-md text-right">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-block border border-border-dark hover:border-primary-container text-on-surface hover:text-primary bg-background-dark py-1 px-3 rounded font-label-caps text-[11px] font-semibold transition-all">
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-text-muted-dark">No repositories match your filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border-dark p-sm px-md flex flex-col sm:flex-row items-center justify-between gap-sm">
          <div className="flex items-center gap-xs text-text-muted-dark font-label-caps text-label-caps">
            Show
            <select className={selectCls} value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            per page · {filtered.length} repos
          </div>
          <div className="flex items-center gap-xs">
            <button disabled={current <= 1} onClick={() => setPage(current - 1)} className="w-8 h-8 rounded border border-border-dark bg-background-dark text-text-muted-dark hover:text-on-surface hover:border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <span className="font-mono-metrics text-xs text-on-surface px-2">{current} / {pages}</span>
            <button disabled={current >= pages} onClick={() => setPage(current + 1)} className="w-8 h-8 rounded border border-border-dark bg-background-dark text-text-muted-dark hover:text-on-surface hover:border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
