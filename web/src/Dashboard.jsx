import { Outlet } from "react-router-dom";
import Sidebar from "./components/dashboard/Sidebar.jsx";
import TopNav from "./components/dashboard/TopNav.jsx";
import { useRadarData } from "./lib/data.js";

export default function Dashboard() {
  const { data, error } = useRadarData();

  return (
    <div className="min-h-screen flex bg-background-dark text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <TopNav
          lastUpdated={data?.last_updated}
          csvHref={`${import.meta.env.BASE_URL}ai_radar_report.csv`}
          repos={data?.all_repos || []}
        />
        <main className="flex-1 overflow-y-auto p-gutter">
          {error ? (
            <div className="max-w-2xl mx-auto mt-16 text-center text-text-muted-dark">
              <p className="font-headline-md text-headline-md text-on-surface mb-2">Couldn’t load data</p>
              <p className="font-body-sm text-body-sm">{String(error.message || error)}</p>
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-64 text-text-muted-dark font-label-caps text-label-caps">
              Loading radar…
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <Outlet context={data} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
