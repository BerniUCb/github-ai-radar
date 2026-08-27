import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Radar, Download, Star, ExternalLink, Menu } from "lucide-react";
import { human, langColor } from "../../lib/data.js";

// "2026-08-26 03:45 UTC" -> "2h ago" (with the absolute time kept as a tooltip).
function relativeTime(s) {
  if (!s) return "—";
  const d = new Date(s.replace(" UTC", "Z").replace(" ", "T"));
  if (isNaN(d)) return s;
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function TopNav({ lastUpdated, csvHref, repos = [], onMenuOpen = () => {} }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return repos
      .filter((r) => `${r.full_name} ${r.description || ""} ${r.topic} ${r.language}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, repos]);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); setActive(-1); }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Keep the highlighted option visible as the user arrows through the list.
  useEffect(() => {
    if (active >= 0) document.getElementById(`search-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Keyboard navigation of the results list (combobox pattern).
  function onKeyDown(e) {
    if (!results.length) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActive((a) => Math.min(a + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) { e.preventDefault(); setActive(0); }
        break;
      case "End":
        if (open) { e.preventDefault(); setActive(results.length - 1); }
        break;
      case "Enter":
        if (open && active >= 0) {
          e.preventDefault();
          window.open(results[active].url, "_blank", "noopener,noreferrer");
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  return (
    <header className="flex justify-between items-center w-full px-lg h-16 sticky top-0 z-50 bg-surface-container-high border-b border-border-dark">
      <div className="flex items-center gap-md flex-1">
        <button
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="md:hidden p-2 -ml-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <div className="md:hidden flex items-center gap-2 text-primary font-headline-md text-headline-md font-bold">
          <Radar size={22} aria-hidden="true" />
        </div>

        <div className="relative w-full max-w-md hidden sm:block" ref={boxRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search repositories, topics…"
            aria-label="Search repositories"
            role="combobox"
            aria-expanded={open && !!query.trim()}
            aria-controls="search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
            className="w-full bg-background-dark border border-border-dark text-on-surface rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-text-muted-dark"
          />

          {open && query.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface-dark border border-border-dark rounded-lg shadow-xl overflow-hidden z-50">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-muted-dark">No matches for “{query.trim()}”.</div>
              ) : (
                <ul id="search-listbox" role="listbox" className="max-h-80 overflow-y-auto py-1">
                  {results.map((r, i) => (
                    <li key={r.full_name} role="option" id={`search-opt-${i}`} aria-selected={active === i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setActive(i)}
                        className={`flex items-center gap-3 px-4 py-2 transition-colors group ${active === i ? "bg-surface-variant" : "hover:bg-surface-variant"}`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: langColor(r.language) }} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-on-surface truncate group-hover:text-primary">{r.full_name}</span>
                          <span className="block text-[11px] text-text-muted-dark truncate">{r.topic} · {r.language || "—"}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs font-mono-metrics text-text-muted-dark shrink-0">
                          <Star size={12} /> {human(r.stars)}
                        </span>
                        <ExternalLink size={13} className="text-text-muted-dark opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-md">
        <div className="hidden md:flex items-center gap-xs font-label-caps text-label-caps text-text-muted-dark" title={lastUpdated ? `Data generated ${lastUpdated}` : undefined}>
          <span className="w-2 h-2 rounded-full bg-secondary live-dot"></span>
          Updated {relativeTime(lastUpdated)}
        </div>
        <a
          href={csvHref || "#"}
          download
          className="ml-2 px-md py-2 bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Download size={16} />
          <span className="hidden lg:inline">Download CSV</span>
        </a>
      </div>
    </header>
  );
}
