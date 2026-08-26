import { scale, linePath, areaPath } from "../../lib/chart.js";

let uid = 0;

export default function Sparkline({ data = [], color = "#6e8bff", height = 32 }) {
  if (!data.length) return null;
  const W = 200, H = height;
  const pts = scale(data, W, H, { padTop: 3, padBottom: 3 });
  const id = `sg${uid++}`;
  return (
    <svg className="w-full" style={{ height }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath(pts, W, H)} fill={`url(#${id})`} />
      <path d={linePath(pts)} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0].toFixed(1)} cy={pts[pts.length - 1][1].toFixed(1)} r="2.4" fill={color} />
    </svg>
  );
}
