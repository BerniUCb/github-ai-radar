import { useOutletContext } from "react-router-dom";
import OverviewHero from "../components/dashboard/OverviewHero.jsx";
import MomentumBars from "../components/dashboard/MomentumBars.jsx";
import TopicDonut from "../components/dashboard/TopicDonut.jsx";
import TrendAreaChart from "../components/dashboard/TrendAreaChart.jsx";
import EmergingTable from "../components/dashboard/EmergingTable.jsx";

export default function Overview() {
  const data = useOutletContext();
  const k = data.kpis;

  // The lead story is the repo climbing fastest — resolve its full record so the
  // hero can show its description, topic, language and stars.
  const feature =
    (data.repos || []).find((r) => r.full_name === k.top_momentum_repo) ||
    (data.repos || [])[0] ||
    null;

  return (
    <div className="space-y-xl">
      <OverviewHero kpis={k} feature={feature} topicCount={data.topic_count} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        <div className="lg:col-span-3"><MomentumBars items={data.top_momentum} /></div>
        <div className="lg:col-span-2"><TopicDonut topics={data.topics} total={k.repos_tracked} /></div>
      </div>

      <TrendAreaChart trend={data.trend} span={data.trend_span} />

      <EmergingTable repos={data.repos} topics={data.topics} />
    </div>
  );
}
