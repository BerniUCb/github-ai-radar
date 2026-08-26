import { NavLink } from "react-router-dom";
import { Radar, LayoutDashboard, TrendingUp, Star, List, HelpCircle, FileText, Code2 } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/momentum", label: "Momentum", icon: TrendingUp },
  { to: "/growth", label: "Star Growth", icon: Star },
  { to: "/repositories", label: "Repositories", icon: List },
];

function itemClass({ isActive }) {
  return [
    "flex items-center gap-md px-md py-sm rounded-lg font-label-caps text-label-caps transition-all",
    isActive
      ? "text-primary font-bold bg-surface-container border-l-2 border-primary"
      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
  ].join(" ");
}

export default function Sidebar() {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col py-md bg-surface-dim border-r border-border-dark z-40">
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
          <NavLink key={to} to={to} end={end} className={itemClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="px-sm mt-auto pt-sm border-t border-border-dark flex flex-col gap-xs">
        <a className="flex items-center gap-md px-md py-xs rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-all font-label-caps text-label-caps" href="#">
          <HelpCircle size={18} /> Help
        </a>
        <a className="flex items-center gap-md px-md py-xs rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-all font-label-caps text-label-caps" href="#">
          <FileText size={18} /> Documentation
        </a>
        <a className="flex items-center gap-md px-md py-xs rounded-lg text-text-muted-dark hover:text-on-surface hover:bg-surface-variant transition-all font-label-caps text-label-caps"
           href="https://github.com/BerniUCb/github-ai-radar" target="_blank" rel="noopener noreferrer">
          <Code2 size={18} /> Source
        </a>
      </div>
    </nav>
  );
}
