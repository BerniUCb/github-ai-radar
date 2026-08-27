import SectionCard from "./SectionCard.jsx";
import InteractiveChart from "./InteractiveChart.jsx";
import { BRAND } from "../../lib/colors.js";

export default function TrendAreaChart({ trend = [], span }) {
  const series = [{ name: "Total stars", values: trend.map((p) => p.total), color: BRAND.primaryContainer }];
  const labels = trend.map((p) => p.t);

  return (
    <SectionCard title="Total stars tracked over time" subtitle={span}>
      <div className="pl-10">
        <InteractiveChart series={series} labels={labels} area height={224} unit="stars" />
      </div>
    </SectionCard>
  );
}
