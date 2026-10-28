import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/dashboard/Sidebar.jsx";
import TopNav from "./components/dashboard/TopNav.jsx";
import RadarSkeleton from "./components/dashboard/RadarSkeleton.jsx";
import { RepoDetailProvider } from "./components/dashboard/RepoDetail.jsx";
import { useRadarData } from "./lib/data.js";

// Momentum needs two snapshots; until there are two, the numbers are zeros.
const RUNS_NEEDED = 2;

export default function Dashboard() {
  const { data, error, reload } = useRadarData();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <RepoDetailProvider>
      <div className="min-h-screen flex bg-background-dark text-on-surface">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen md:ml-64">
          <TopNav
            lastUpdated={data?.last_updated}
            csvHref={`${import.meta.env.BASE_URL}ai_radar_report.csv`}
            repos={data?.all_repos || []}
            onMenuOpen={() => setMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-md md:p-gutter">
            {error ? (
              <div role="alert" className="max-w-xl mx-auto mt-16 text-center">
                <p className="font-headline-md text-headline-md text-on-surface mb-2">Couldn’t load the radar data</p>
                <p className="font-body-sm text-body-sm text-text-muted-dark">
                  The dashboard reads <code className="font-mono-metrics">data.json</code>, which didn’t load ({String(error.message || error)}).
                </p>
                <button
                  type="button"
                  onClick={reload}
                  className="mt-lg px-md py-2 rounded-lg bg-primary-container text-on-primary-container font-label-caps text-label-caps hover:brightness-110 transition-all"
                >
                  Try again
                </button>
              </div>
            ) : !data ? (
              <RadarSkeleton />
            ) : (
              <div className="max-w-7xl mx-auto space-y-gutter">
                {data.history_runs < RUNS_NEEDED && <FirstRunNotice runs={data.history_runs} />}
                <Outlet context={data} />
              </div>
            )}
          </main>
        </div>
      </div>
    </RepoDetailProvider>
  );
}

function FirstRunNotice({ runs }) {
  return (
    <div role="status" className="bg-surface-dark border border-border-dark rounded-xl p-lg">
      <p className="font-headline-md text-headline-md text-on-surface">Collecting history</p>
      <p className="mt-1 font-body-sm text-body-sm text-text-muted-dark">
        {runs} of {RUNS_NEEDED} snapshots saved. Growth, momentum and emerging repos appear after the next update,
        about 6 hours from now.
      </p>
    </div>
  );
}
