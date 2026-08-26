// Tiny helpers to turn a numeric series into SVG path strings. Keeps the charts
// dependency-free (no chart library) and fully self-contained.

export function scale(values, width, height, { padTop = 4, padBottom = 4, min, max } = {}) {
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const range = hi - lo || 1;
  const n = values.length;
  const step = n > 1 ? width / (n - 1) : 0;
  return values.map((v, i) => [
    i * step,
    height - padBottom - ((v - lo) / range) * (height - padBottom - padTop),
  ]);
}

export function linePath(points) {
  return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}

export function areaPath(points, width, height) {
  return `${linePath(points)} L${width} ${height} L0 ${height} Z`;
}
