"""
GitHub AI Radar — detects emerging AI repos by measuring their momentum
(stars gained per hour between runs).

ETL pipeline:
  extract  → scraping via the GitHub Search API
  storage  → historical snapshots in SQLite
  transform→ momentum calculation with Polars
  cli      → orchestration

Public symbols are re-exported for stable use and importing.
"""

from .config import (
    AI_TOPICS,
    API,
    DB_PATH,
    EMERGING_MIN_MOMENTUM,
    EMERGING_MIN_STARS,
    OUTPUT_CSV,
)
from .extract import build_headers, collect, fetch_topic
from .storage import init_db, previous_snapshot, save_snapshot
from .transform import compute_momentum

__all__ = [
    "AI_TOPICS",
    "API",
    "DB_PATH",
    "EMERGING_MIN_MOMENTUM",
    "EMERGING_MIN_STARS",
    "OUTPUT_CSV",
    "build_headers",
    "collect",
    "fetch_topic",
    "init_db",
    "previous_snapshot",
    "save_snapshot",
    "compute_momentum",
]
