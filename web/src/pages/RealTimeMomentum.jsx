import { useOutletContext } from "react-router-dom";
import Podium from "../components/dashboard/Podium.jsx";
import ScatterPlot from "../components/dashboard/ScatterPlot.jsx";
import LiveMoversFeed from "../components/dashboard/LiveMoversFeed.jsx";

export default function RealTimeMomentum() {
  const data = useOutletContext();

  return (
    <div className="space-y-gutter">
      <div className="flex items-center gap-md">
        <h1 className="font-headline-lg text-headline-lg text-text-primary-dark">Real-Time Momentum</h1>
        <div className="bg-surface-dark border border-border-dark rounded-full px-3 py-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary live-dot" />
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Live</span>
        </div>
      </div>

      <Podium repos={data.repos} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8"><ScatterPlot repos={data.repos} /></div>
        <div className="lg:col-span-4"><LiveMoversFeed movers={data.movers} /></div>
      </div>
    </div>
  );
}
