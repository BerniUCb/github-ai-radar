import { useOutletContext } from "react-router-dom";
import Podium from "../components/dashboard/Podium.jsx";
import ScatterPlot from "../components/dashboard/ScatterPlot.jsx";
import LiveMoversFeed from "../components/dashboard/LiveMoversFeed.jsx";
import Freshness from "../components/dashboard/Freshness.jsx";

export default function RealTimeMomentum() {
  const data = useOutletContext();

  return (
    <div className="space-y-gutter">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Momentum</h1>
          <p className="font-body-md text-body-md text-text-muted-dark mt-1">
            Star velocity across tracked repos, refreshed every 6 hours.
          </p>
        </div>
        <Freshness lastUpdated={data.last_updated} />
      </div>

      <Podium repos={data.repos} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8"><ScatterPlot repos={data.repos} /></div>
        <div className="lg:col-span-4"><LiveMoversFeed movers={data.movers} /></div>
      </div>
    </div>
  );
}
