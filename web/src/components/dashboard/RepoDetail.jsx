import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Sparkline from "./Sparkline.jsx";
import { RepoDetailContext } from "../../lib/repoDetail.js";
import { human, langColor } from "../../lib/data.js";
import { BRAND } from "../../lib/colors.js";

export function RepoDetailProvider({ children }) {
  const [repo, setRepo] = useState(null);
  // The element that was focused before the panel opened; focus returns there.
  const openerRef = useRef(null);

  const openRepo = useCallback((r) => {
    openerRef.current = document.activeElement;
    setRepo(r);
  }, []);

  const close = useCallback(() => {
    setRepo(null);
    openerRef.current?.focus?.();
  }, []);

  return (
    <RepoDetailContext.Provider value={openRepo}>
      {children}
      {repo && <RepoDetailPanel repo={repo} onClose={close} />}
    </RepoDetailContext.Provider>
  );
}

function Stat({ label, value, accent = "text-on-surface" }) {
  return (
    <div className="bg-surface-container-low border border-border-dark rounded-lg p-md">
      <dt className="font-label-caps text-label-caps text-text-muted-dark">{label}</dt>
      <dd className={`mt-1 font-mono-metrics text-mono-metrics ${accent}`}>{value}</dd>
    </div>
  );
}

function RepoDetailPanel({ repo: r, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const hasSpark = Array.isArray(r.spark) && r.spark.length >= 2;

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Escape closes; Tab wraps inside the panel so focus can't reach the page
    // behind the overlay while the dialog is open.
    function onKey(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-surface-dark border-l border-border-dark shadow-2xl overflow-y-auto p-lg"
      >
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-label-caps text-label-caps text-text-muted-dark">
              <span className="w-2 h-2 rounded-full" style={{ background: langColor(r.language) }} aria-hidden="true" />
              {r.language || "No language"} · {r.topic}
            </p>
            <h2 id={titleId} className="mt-xs font-headline-md text-headline-md text-on-surface break-words">
              {r.full_name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 p-2 -mr-2 rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-md flex items-center gap-2">
          {r.emerging ? (
            <span className="px-2 py-0.5 rounded-full font-label-caps text-label-caps bg-primary-container/10 text-primary-container border border-primary-container/30">
              Emerging
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full font-label-caps text-label-caps bg-surface-container text-text-muted-dark border border-border-dark">
              Steady
            </span>
          )}
        </div>

        <p className="mt-md font-body-md text-body-md text-text-muted-dark">{r.description || "No description provided."}</p>

        <dl className="mt-lg grid grid-cols-2 gap-md">
          <Stat label="Stars" value={human(r.stars)} />
          <Stat label="Forks" value={human(r.forks)} />
          <Stat label="Gained since last update" value={`+${human(r.gained)}`} accent="text-secondary" />
          <Stat label="Momentum" value={`${human(r.momentum)} ★/h`} accent="text-primary" />
          <Stat label="License" value={r.license || "None listed"} />
        </dl>

        {hasSpark && (
          <section className="mt-lg">
            <h3 className="font-label-caps text-label-caps text-text-muted-dark">
              Stars over the last {r.spark.length} snapshots
            </h3>
            <p className="mt-1 font-mono-metrics text-mono-metrics text-on-surface">
              {human(r.spark[0])} → {human(r.spark[r.spark.length - 1])}
            </p>
            <div className="mt-md">
              <Sparkline data={r.spark} height={72} color={BRAND.secondary} />
            </div>
          </section>
        )}

        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-xl inline-flex items-center gap-2 px-md py-2 rounded-lg bg-primary-container text-on-primary-container font-label-caps text-label-caps hover:brightness-110 transition-all"
        >
          View on GitHub
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}
