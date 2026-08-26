"""
Pipeline orchestration: wires Extract → Load → Transform → Report.

Entry point: `python -m ai_radar`
"""

import argparse
import os
import sys
from pathlib import Path

import polars as pl

from .config import OUTPUT_CSV
from .extract import collect
from .render import render_dashboard
from .storage import init_db, previous_snapshot, save_snapshot
from .transform import compute_momentum

DOCS_CSV = Path("docs/ai_radar_report.csv")


def resolve_token(cli_token: str | None) -> str | None:
    """Resolve the GitHub token: the --token flag wins over $GITHUB_TOKEN.

    Reading from the environment keeps the token out of shell history and lets
    CI (e.g. GitHub Actions) inject it as a secret.
    """
    return cli_token or os.environ.get("GITHUB_TOKEN")


def run(days: int, token: str | None) -> None:
    print("== GitHub AI Radar ==")
    print("[1/4] Collecting AI repos...")
    current = collect(days, token)

    print("[2/4] Loading history...")
    con = init_db()
    previous = previous_snapshot(con)
    first_run = previous.height == 0
    if first_run:
        print("  (first run: no momentum yet, run again later)")

    print("[3/4] Computing momentum...")
    report = compute_momentum(current, previous)

    print("[4/4] Saving snapshot, exporting and rendering dashboard...")
    save_snapshot(con, current)

    out = report.select([
        "full_name", "stars", "stars_gained", "stars_per_hour",
        "emerging", "language", "topic_hit", "description", "url",
    ])
    out.write_csv(OUTPUT_CSV)

    # Static dashboard for GitHub Pages (index.html + a copy of the CSV so the
    # in-page download link resolves next to it).
    html_path = render_dashboard(report, con)
    DOCS_CSV.parent.mkdir(parents=True, exist_ok=True)
    out.write_csv(DOCS_CSV)
    con.close()
    print(f"  dashboard -> {html_path}")

    # Console summary
    emerging = out.filter(pl.col("emerging"))
    print(f"\nDone -> {OUTPUT_CSV}  ({out.height} repos)")
    if not first_run and emerging.height:
        print(f"\n🚀 {emerging.height} EMERGING repos:")
        for r in emerging.head(10).iter_rows(named=True):
            print(f"   {r['stars_per_hour']:.1f}★/h  {r['full_name']}  ({r['stars']}★)")
    else:
        print("\nTop by stars right now:")
        for r in out.head(10).iter_rows(named=True):
            print(f"   {r['stars']:>6}★  {r['full_name']}")


def main() -> None:
    # The console summary uses ★ and 🚀; force UTF-8 so Windows' default
    # cp1252 console doesn't crash on them.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    ap = argparse.ArgumentParser(description="GitHub AI Radar")
    ap.add_argument("--days", type=int, default=30, help="max age of the repos (days)")
    ap.add_argument(
        "--token",
        default=None,
        help="GitHub Personal Access Token (optional; falls back to $GITHUB_TOKEN)",
    )
    args = ap.parse_args()

    run(args.days, resolve_token(args.token))


if __name__ == "__main__":
    main()
