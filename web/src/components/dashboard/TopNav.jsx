import { Search, Radar, Bell, Activity, Download } from "lucide-react";

export default function TopNav({ lastUpdated, csvHref }) {
  return (
    <header className="flex justify-between items-center w-full px-lg h-16 sticky top-0 z-50 bg-surface-container-high border-b border-border-dark">
      <div className="flex items-center gap-md flex-1">
        <div className="md:hidden flex items-center gap-2 text-primary font-headline-md text-headline-md font-bold">
          <Radar size={22} />
        </div>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark" />
          <input
            type="text"
            placeholder="Search repositories, topics…"
            className="w-full bg-background-dark border border-border-dark text-on-surface rounded-lg py-2 pl-10 pr-12 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-text-muted-dark"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-variant px-1.5 py-0.5 rounded text-[10px] font-label-caps text-text-muted-dark border border-border-dark">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <div className="hidden md:flex items-center gap-xs font-label-caps text-label-caps text-text-muted-dark mr-sm">
          <span className="w-2 h-2 rounded-full bg-secondary live-dot"></span>
          Updated {lastUpdated || "—"}
        </div>
        <button className="w-10 h-10 rounded-full border border-border-dark hover:bg-surface-variant flex items-center justify-center text-text-muted-dark hover:text-primary transition-colors" aria-label="Live status">
          <Activity size={18} />
        </button>
        <div className="relative">
          <button className="w-10 h-10 rounded-full border border-border-dark hover:bg-surface-variant flex items-center justify-center text-text-muted-dark hover:text-primary transition-colors" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error-coral rounded-full"></span>
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
