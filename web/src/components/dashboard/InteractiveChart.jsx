import { useRef, useState, useMemo } from "react";
import { human } from "../../lib/data.js";

const PALETTE = ["#6e8bff", "#42e1b3", "#b7c4ff", "#ffb960", "#FF6B7D"];
const PAD = 6; // vertical padding, in percent of the plot height

function fmtLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

// Interactive multi-series line chart. `mode="index"` normalises each series to
// percent growth from its own starting value so trajectories are comparable.
export default function InteractiveChart({ series = [], labels = [], area = false, mode = "absolute", height = 320, unit = "" }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const model = useMemo(() => {
    const clean = series.filter((s) => s.values && s.values.length >= 2);
    if (!clean.length) return null;
    const n = Math.min(...clean.map((s) => s.values.length));
    const prepared = clean.map((s, i) => {
      const raw = s.values.slice(0, n);
      const first = raw[0] || 1;
      const disp = mode === "index" ? raw.map((v) => (v / first - 1) * 100) : raw;
      return { name: s.name, color: s.color || PALETTE[i % PALETTE.length], raw, disp };
    });
    const allDisp = prepared.flatMap((s) => s.disp);
    let min = Math.min(...allDisp, mode === "index" ? 0 : Infinity);
    let max = Math.max(...allDisp);
    if (min === max) { max += 1; min -= 1; }
    const range = max - min;
    const xOf = (i) => (n > 1 ? (i / (n - 1)) * 100 : 0);
    const yOf = (v) => PAD + (1 - (v - min) / range) * (100 - 2 * PAD);
    prepared.forEach((s) => { s.pts = s.disp.map((v, i) => [xOf(i), yOf(v)]); });
    return { prepared, n, min, max, xOf };
  }, [series, mode]);

  if (!model) {
    return <div style={{ height }} className="flex items-center justify-center text-text-muted-dark font-label-caps text-label-caps">Not enough history yet — check back after a few runs.</div>;
  }

  const { prepared, n, min, max } = model;
  const line = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const fmt = (v) => (mode === "index" ? `${v >= 0 ? "+" : ""}${v.toFixed(1)}%` : human(v));

  // Text summary for screen readers: each series' start → end value.
  const summary = prepared
    .map((s) => {
      const start = human(s.raw[0]);
      const end = human(s.raw[s.raw.length - 1]);
      const name = s.name.split("/").pop();
      return mode === "index"
        ? `${name}: ${fmt(s.disp[s.disp.length - 1])} growth`
        : `${name}: from ${start} to ${end}${unit ? ` ${unit}` : ""}`;
    })
    .join("; ");
  const ariaLabel = `Line chart over ${n} points. ${summary}.`;

  function onMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))));
  }
  const hx = hover != null ? (hover / (n - 1)) * 100 : 0;
  const tipSide = hx > 82 ? "-100%" : hx < 18 ? "0%" : "-50%";

  return (
    <div className="relative w-full" style={{ height }} ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {/* y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono-metrics text-text-muted-dark pointer-events-none z-10">
        <span>{fmt(max)}</span><span>{fmt((max + min) / 2)}</span><span>{fmt(min)}</span>
      </div>

      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" role="img" aria-label={ariaLabel}>
        {[25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#262B38" strokeDasharray="2" opacity="0.5" vectorEffect="non-scaling-stroke" />)}
        {area && prepared.length === 1 && (
          <>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={prepared[0].color} stopOpacity="0.32" />
                <stop offset="100%" stopColor={prepared[0].color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line(prepared[0].pts)} L100 100 L0 100 Z`} fill="url(#areaFill)" />
          </>
        )}
        {prepared.map((s) => (
          <path key={s.name} d={line(s.pts)} fill="none" stroke={s.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hover != null && <line x1={hx} y1="0" x2={hx} y2="100" stroke="#8e909f" strokeDasharray="3" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>

      {/* hover dots */}
      {hover != null && prepared.map((s) => (
        <span
          key={s.name}
          className="absolute w-2.5 h-2.5 rounded-full border-2 border-surface-dark pointer-events-none"
          style={{ left: `${s.pts[hover][0]}%`, top: `${s.pts[hover][1]}%`, transform: "translate(-50%, -50%)", background: s.color, boxShadow: `0 0 8px ${s.color}` }}
        />
      ))}

      {/* tooltip */}
      {hover != null && (
        <div
          className="absolute z-20 bg-surface-container-high border border-border-dark rounded-lg p-3 shadow-lg pointer-events-none min-w-[160px]"
          style={{ left: `${hx}%`, top: 0, transform: `translateX(${tipSide})` }}
        >
          {labels[hover] && <div className="text-[10px] font-label-caps text-text-muted-dark mb-2">{fmtLabel(labels[hover])}</div>}
          <div className="flex flex-col gap-1">
            {prepared.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-4 font-mono-metrics text-xs">
                <span className="flex items-center gap-2 text-on-surface">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.name.split("/").pop()}
                </span>
                <span className="text-text-primary-dark">
                  {human(s.raw[hover])}{unit && ` ${unit}`}
                  {mode === "index" && <span className="text-secondary ml-1">{fmt(s.disp[hover])}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
