import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Radar, TrendingUp, Star, List, LayoutDashboard, HelpCircle, FileText, Code2, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/momentum", label: "Momentum", icon: TrendingUp },
  { to: "/growth", label: "Star Growth", icon: Star },
  { to: "/repositories", label: "Repositories", icon: List },
];

function itemClass({ isActive }) {
  return [
    "flex items-center gap-md px-md py-2.5 rounded-lg font-label-caps text-label-caps transition-all",
    isActive
      ? "text-primary font-bold bg-surface-container border-l-2 border-primary"
      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
  ].join(" ");
}

const footerLink =
  "flex items-center gap-md px-md py-2.5 rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-all font-label-caps text-label-caps";

// Shared nav body used by both the desktop rail and the mobile drawer.
function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="px-lg pb-lg mb-sm border-b border-border-dark">
        <div className="flex items-center gap-sm">
          <Radar className="text-primary" size={26} />
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold leading-none">AI Radar</h1>
            <p className="font-label-caps text-label-caps text-text-muted-dark mt-1">emerging AI repos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-sm flex flex-col gap-xs">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={itemClass}>
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="px-sm mt-auto pt-sm border-t border-border-dark flex flex-col gap-xs">
        <a
          className={footerLink}
          href="https://github.com/BerniUCb/github-ai-radar#readme"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <HelpCircle size={18} aria-hidden="true" /> Help
        </a>
        <a
          className={footerLink}
          href="https://github.com/BerniUCb/github-ai-radar#readme"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <FileText size={18} aria-hidden="true" /> Documentation
        </a>
        <a
          className={footerLink}
          href="https://github.com/BerniUCb/github-ai-radar"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <Code2 size={18} aria-hidden="true" /> Source
        </a>
      </div>
    </>
  );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  // Lock body scroll and wire Escape while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      {/* Desktop rail */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col py-md bg-surface-dim border-r border-border-dark z-40">
        <SidebarContent />
      </nav>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] flex flex-col py-md bg-surface-dim border-r border-border-dark shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Main navigation"
        >
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 p-2 rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <SidebarContent onNavigate={onClose} />
        </nav>
      </div>
    </>
  );
}
