import SectionCard from "./SectionCard.jsx";
import { scale, linePath, areaPath } from "../../lib/chart.js";
import { human } from "../../lib/data.js";

export default function TrendAreaChart({ trend = [], span }) {
  const values = trend.map((p) => p.total);
  const W = 1000, H = 200;
  const enough = values.length >= 2;
  const pts = enough ? scale(values, W, H, { padTop: 12, padBottom: 12, min: 0 }) : [];
  const grid = [40, 93, 146];
  const yMax = Math.max(...values, 1);

  return (
    <SectionCard title="Total stars tracked over time" subtitle={span}>
      <div className="h-56 w-full relative">
        {enough && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono-metrics text-text-muted-dark pointer-events-none pb-4 z-10">
            <span>{human(yMax)}</span>
            <span>{human(yMax / 2)}</span>
            <span>0</span>
          </div>
        )}
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6e8bff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6e8bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((gy) => (
            <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="#262B38" strokeDasharray="4" />
          ))}
          {enough ? (
            <>
              <path d={areaPath(pts, W, H)} fill="url(#trendGrad)" />
              <path d={linePath(pts)} fill="none" stroke="#6e8bff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              <circle cx={pts[pts.length - 1][0].toFixed(1)} cy={pts[pts.length - 1][1].toFixed(1)} r="4" fill="#6e8bff" />
            </>
          ) : (
            <text x={W / 2} y={H / 2} textAnchor="middle" fill="#8A92A6" fontSize="14" fontFamily="IBM Plex Mono">
              not enough history yet
            </text>
          )}
        </svg>
      </div>
    </SectionCard>
  );
}
