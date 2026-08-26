"""
EXPORT layer: turn the momentum report + snapshot history into `data.json`,
the single payload the React dashboard fetches at runtime.

Kept separate from scraping/transform so the presentation contract lives in one
place. Everything here is derived from real data (report + SQLite snapshots).
"""

import json
import sqlite3
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import polars as pl

OUTPUT_JSON = Path("web/public/data.json")

TABLE_ROWS = 40        # rows for the Overview "emerging" table
BAR_COUNT = 6          # bars in the momentum chart
GROWTH_SERIES = 5      # repos plotted on the Star Growth page
MOVERS = 8             # items in the live movers feed
MILESTONES = [100_000, 50_000, 10_000, 5_000, 1_000]


def _human(n) -> str:
    if n is None:
        return "0"
    n = float(n)
    if abs(n) >= 1_000_000:
        return f"{n / 1_000_000:.1f}M".replace(".0M", "M")
    if abs(n) >= 1_000:
        return f"{n / 1_000:.1f}k".replace(".0k", "k")
    return f"{n:.0f}"


def _mo(v) -> int:
    return round(v) if v is not None else 0


def _int(v) -> int:
    return int(v) if v is not None else 0


def _load_history(con: sqlite3.Connection):
    """Read every snapshot once and build the per-repo and per-time series."""
    rows = con.execute("SELECT id, stars, captured FROM snapshots ORDER BY captured").fetchall()
    per_id: dict[int, list[int]] = defaultdict(list)
    totals: dict[str, int] = defaultdict(int)
    counts: dict[str, int] = defaultdict(int)
    for rid, stars, captured in rows:
        per_id[rid].append(stars)
        totals[captured] += stars
        counts[captured] += 1
    times = sorted(totals)
    return {
        "per_id": per_id,
        "times": times,
        "totals": [totals[t] for t in times],
        "counts": [counts[t] for t in times],
    }


def _trend_span(times: list[str]) -> str:
    if len(times) < 2:
        return "not enough history yet"
    hours = (datetime.fromisoformat(times[-1]) - datetime.fromisoformat(times[0])).total_seconds() / 3600
    return f"{hours:.0f}h of history" if hours < 48 else f"{hours / 24:.0f}-day trend"


def _repo_dict(r: dict, rank: int) -> dict:
    return {
        "rank": rank,
        "full_name": r["full_name"],
        "url": r.get("url", "#"),
        "description": r.get("description") or "",
        "language": r.get("language") or "",
        "topic": r.get("topic_hit", ""),
        "stars": _int(r.get("stars")),
        "forks": _int(r.get("forks")),
        "license": r.get("license") or "",
        "gained": _int(r.get("stars_gained")),
        "momentum": _mo(r.get("stars_per_hour")),
        "emerging": bool(r.get("emerging")),
    }


def build_payload(report: pl.DataFrame, con: sqlite3.Connection, repo_slug: str) -> dict:
    now = datetime.now(timezone.utc)
    hist = _load_history(con)
    ordered = report.to_dicts()  # already sorted by momentum desc

    emerging = [r for r in ordered if r.get("emerging")]
    top = ordered[0] if ordered else {}
    total_gained = report.select(pl.col("stars_gained").fill_null(0).sum()).item() if report.height else 0

    kpis = {
        "repos_tracked": report.height,
        "emerging_now": len(emerging),
        "top_momentum": _human(_mo(top.get("stars_per_hour"))),
        "top_momentum_repo": top.get("full_name", "—"),
        "stars_gained": _human(total_gained),
        # Decorative sparklines from real snapshot history.
        "spark_tracked": hist["counts"][-12:],
        "spark_emerging": hist["counts"][-12:],
        "spark_momentum": hist["totals"][-12:],
        "spark_gained": hist["totals"][-12:],
    }

    # Topic distribution
    topic_counts = (
        report.group_by("topic_hit").len().sort("len", descending=True).rows()
    )
    topics = [{"name": t, "count": c} for t, c in topic_counts]

    # Top momentum bars
    bars_src = ordered[:BAR_COUNT]
    max_mo = max((_mo(r.get("stars_per_hour")) for r in bars_src), default=1) or 1
    top_momentum = [{
        "full_name": r["full_name"],
        "short": r["full_name"].split("/", 1)[-1],
        "value": _human(_mo(r.get("stars_per_hour"))),
        "pct": max(6, round(_mo(r.get("stars_per_hour")) / max_mo * 100)),
    } for r in bars_src]

    # Table rows (Overview) + full list (Repositories)
    repos = [_repo_dict(r, i) for i, r in enumerate(ordered[:TABLE_ROWS], start=1)]
    # Attach a per-repo spark to the top few (for the Momentum podium).
    for rep, src in zip(repos[:3], ordered[:3]):
        series = hist["per_id"].get(src["id"], [])
        rep["spark"] = series[-10:] if len(series) >= 2 else []
    all_repos = [_repo_dict(r, i) for i, r in enumerate(ordered, start=1)]

    # Trend (total stars over time)
    trend = [{"t": t, "total": v} for t, v in zip(hist["times"], hist["totals"])]

    # Star-growth series (per-repo history for the top movers)
    growth_series = []
    for r in ordered[:GROWTH_SERIES]:
        values = hist["per_id"].get(r["id"], [])
        if len(values) < 2:
            continue
        first, last = values[0], values[-1]
        span_h = (datetime.fromisoformat(hist["times"][-1]) - datetime.fromisoformat(hist["times"][0])).total_seconds() / 3600 or 1
        growth_series.append({
            "full_name": r["full_name"],
            "url": r.get("url", "#"),
            "values": values,
            "last": last,
            "growth_pct": round((last - first) / first * 100) if first else None,
            "velocity": round((last - first) / (span_h / 24)) if span_h else 0,
        })

    # Live movers feed (biggest recent gainers, classified)
    movers = []
    for r in sorted(ordered, key=lambda x: _int(x.get("stars_gained")), reverse=True)[:MOVERS]:
        gained, stars = _int(r.get("stars_gained")), _int(r.get("stars"))
        crossed = next((m for m in MILESTONES if stars >= m > stars - gained), None)
        movers.append({
            "full_name": r["full_name"],
            "url": r.get("url", "#"),
            "gained": gained,
            "momentum": _mo(r.get("stars_per_hour")),
            "topic": r.get("topic_hit", ""),
            "kind": "milestone" if crossed else ("surge" if gained >= 100 else "new"),
            "threshold": crossed,
        })

    return {
        "generated_at": now.strftime("%Y-%m-%d %H:%M UTC"),
        "last_updated": now.strftime("%Y-%m-%d %H:%M UTC"),
        "repo_slug": repo_slug,
        "topic_count": len(topics),
        "kpis": kpis,
        "topics": topics,
        "top_momentum": top_momentum,
        "trend": trend,
        "trend_span": _trend_span(hist["times"]),
        "repos": repos,
        "all_repos": all_repos,
        "growth": {"series": growth_series},
        "movers": movers,
    }


def export_data(
    report: pl.DataFrame,
    con: sqlite3.Connection,
    out_path: Path = OUTPUT_JSON,
    repo_slug: str = "BerniUCb/github-ai-radar",
) -> Path:
    payload = build_payload(report, con, repo_slug)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path
