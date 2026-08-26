"""
REPORT layer: render the momentum report into a static HTML dashboard.

Takes the transformed report DataFrame (plus the snapshot history for the
trend chart) and fills a Jinja2 template. The output is a self-contained
`index.html` ready to publish on GitHub Pages.
"""

import math
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import polars as pl
from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
OUTPUT_HTML = Path("docs/index.html")
TABLE_ROWS = 30          # how many repos to list in the table
BAR_COUNT = 6            # bars in the "top momentum" chart

# GitHub language colors (subset covering the common AI-repo languages).
LANG_COLORS = {
    "Python": "#3572A5", "TypeScript": "#3178c6", "JavaScript": "#f1e05a",
    "Rust": "#dea584", "Go": "#00ADD8", "C++": "#f34b7d", "C": "#555555",
    "Jupyter Notebook": "#DA5B0B", "Java": "#b07219", "Shell": "#89e051",
    "HTML": "#e34c26", "Ruby": "#701516", "Swift": "#F05138", "Kotlin": "#A97BFF",
    "": "#8A92A6",
}
# Cohesive indigo/teal palette for the donut segments (matches the theme).
DONUT_COLORS = ["#6e8bff", "#00c599", "#cd8200", "#b7c4ff", "#42e1b3", "#8e909f", "#3554c6"]


def _human(n: int | float | None) -> str:
    """Compact number formatting: 45230 -> '45.2k', 1200000 -> '1.2M'."""
    if n is None:
        return "0"
    n = float(n)
    if abs(n) >= 1_000_000:
        return f"{n / 1_000_000:.1f}M".replace(".0M", "M")
    if abs(n) >= 1_000:
        return f"{n / 1_000:.1f}k".replace(".0k", "k")
    return f"{n:.0f}"


def _short_name(full_name: str) -> str:
    """Drop the owner prefix for compact chart labels (`owner/repo` -> `repo`)."""
    return full_name.split("/", 1)[-1]


def _momentum(value: float | None) -> int:
    return round(value) if value is not None else 0


def _build_trend(con: sqlite3.Connection) -> dict:
    """Build the area-chart path from total stars per snapshot over time."""
    rows = con.execute(
        "SELECT captured, SUM(stars) FROM snapshots GROUP BY captured ORDER BY captured"
    ).fetchall()
    grid = [40, 93, 146]  # horizontal gridlines in the 0..200 viewBox

    if len(rows) < 2:
        return {"line": "M0 100 L1000 100", "area": "M0 100 L1000 100 L1000 200 L0 200 Z",
                "grid": grid, "span": "not enough history yet"}

    values = [r[1] for r in rows]
    lo, hi = min(values), max(values)
    rng = (hi - lo) or 1
    n = len(values)
    pad_t, pad_b, H, W = 12, 20, 200, 1000

    def y(v: float) -> float:
        return H - pad_b - (v - lo) / rng * (H - pad_b - pad_t)

    pts = [(i * W / (n - 1), y(v)) for i, v in enumerate(values)]
    line = " ".join(("M" if i == 0 else "L") + f"{x:.1f} {yy:.1f}" for i, (x, yy) in enumerate(pts))
    area = line + f" L{W} {H} L0 {H} Z"

    t0 = datetime.fromisoformat(rows[0][0])
    t1 = datetime.fromisoformat(rows[-1][0])
    hours = (t1 - t0).total_seconds() / 3600
    span = f"{hours:.0f}h of history" if hours < 48 else f"{hours / 24:.0f}-day trend"
    return {"line": line, "area": area, "grid": grid, "span": span}


def _build_donut(report: pl.DataFrame) -> list[dict]:
    """Topic distribution as donut segments (dasharray/offset for r=40)."""
    counts = (
        report.group_by("topic_hit").len()
        .sort("len", descending=True)
        .rows()  # list of (topic, count)
    )
    total = sum(c for _, c in counts) or 1
    circumference = 2 * math.pi * 40
    segments, offset = [], 0.0
    for i, (topic, count) in enumerate(counts):
        dash = count / total * circumference
        segments.append({
            "name": topic, "count": count, "color": DONUT_COLORS[i % len(DONUT_COLORS)],
            "dash": round(dash, 2), "gap": round(circumference - dash, 2),
            "offset": round(-offset, 2),
        })
        offset += dash
    return segments


def build_context(report: pl.DataFrame, con: sqlite3.Connection, repo_slug: str) -> dict:
    """Assemble every value the template needs from the report + history."""
    now = datetime.now(timezone.utc)
    emerging = report.filter(pl.col("emerging"))
    top = report.head(1).to_dicts()[0] if report.height else {}
    total_gained = report.select(pl.col("stars_gained").fill_null(0).sum()).item() if report.height else 0

    kpi = {
        "repos_tracked": report.height,
        "emerging_now": emerging.height,
        "top_momentum": _human(_momentum(top.get("stars_per_hour"))),
        "top_momentum_repo": top.get("full_name", "—"),
        "stars_gained": _human(total_gained),
    }

    top_bars = report.head(BAR_COUNT).to_dicts()
    max_mo = max((_momentum(r.get("stars_per_hour")) for r in top_bars), default=1) or 1
    top_momentum = [{
        "name": r["full_name"], "short": _short_name(r["full_name"]),
        "value": _human(_momentum(r.get("stars_per_hour"))),
        "pct": max(6, round(_momentum(r.get("stars_per_hour")) / max_mo * 100)),
    } for r in top_bars]

    table = report.head(TABLE_ROWS).to_dicts()
    max_row_mo = max((_momentum(r.get("stars_per_hour")) for r in table), default=1) or 1
    rows = []
    for i, r in enumerate(table, start=1):
        lang = r.get("language") or ""
        rows.append({
            "rank": i, "name": r["full_name"], "url": r.get("url", "#"),
            "lang": lang or "—", "lang_color": LANG_COLORS.get(lang, "#8A92A6"),
            "topic": r.get("topic_hit", ""), "stars": _human(r.get("stars")),
            "gained": "+" + _human(r.get("stars_gained")),
            "momentum": _human(_momentum(r.get("stars_per_hour"))),
            "pct": max(4, round(_momentum(r.get("stars_per_hour")) / max_row_mo * 100)),
            "emerging": bool(r.get("emerging")),
            "search": (r["full_name"] + " " + (r.get("description") or "")).lower(),
        })

    topics = report.select("topic_hit").unique().to_series().to_list()

    return {
        "kpi": kpi, "top_momentum": top_momentum, "donut": _build_donut(report),
        "trend": _build_trend(con), "rows": rows, "topics": sorted(topics),
        "topic_count": len(topics), "repo_slug": repo_slug,
        "csv_href": "ai_radar_report.csv",
        "last_updated": now.strftime("%Y-%m-%d %H:%M UTC"),
        "generated_at": now.strftime("%Y-%m-%d %H:%M UTC"),
    }


def render_dashboard(
    report: pl.DataFrame,
    con: sqlite3.Connection,
    out_path: Path = OUTPUT_HTML,
    repo_slug: str = "BerniUCb/github-ai-radar",
) -> Path:
    """Render the report into a static HTML dashboard at `out_path`."""
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    html = env.get_template("dashboard.html.j2").render(**build_context(report, con, repo_slug))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    return out_path
