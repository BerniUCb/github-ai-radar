import { useOutletContext } from "react-router-dom";
import { Database, Rocket, Gauge, Star } from "lucide-react";
import StatCard from "../components/dashboard/StatCard.jsx";
import MomentumBars from "../components/dashboard/MomentumBars.jsx";
import TopicDonut from "../components/dashboard/TopicDonut.jsx";
import TrendAreaChart from "../components/dashboard/TrendAreaChart.jsx";
import EmergingTable from "../components/dashboard/EmergingTable.jsx";
import { human } from "../lib/data.js";

export default function Overview() {
  const data = useOutletContext();
  const k = data.kpis;

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <StatCard label="Repos tracked" value={human(k.repos_tracked)} sub={`across ${data.topic_count} AI topics`} icon={Database} spark={k.spark_tracked} />
        <StatCard label="Emerging now" value={k.emerging_now} sub="breaking growth thresholds" icon={Rocket} accent spark={k.spark_emerging} />
        <StatCard label="Top momentum" value={k.top_momentum} unit="★/h" sub={k.top_momentum_repo} icon={Gauge} spark={k.spark_momentum} />
        <StatCard label="Stars gained (run)" value={k.stars_gained} sub="since previous snapshot" icon={Star} spark={k.spark_gained} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        <div className="lg:col-span-3"><MomentumBars items={data.top_momentum} /></div>
        <div className="lg:col-span-2"><TopicDonut topics={data.topics} total={k.repos_tracked} /></div>
      </div>

      <TrendAreaChart trend={data.trend} span={data.trend_span} />

      <EmergingTable repos={data.repos} topics={data.topics} />
    </div>
  );
}
