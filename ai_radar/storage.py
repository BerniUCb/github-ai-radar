"""
LOAD layer: historical snapshots in SQLite.

Each run stores (id, stars, timestamp) per repo. The accumulated history is
what makes it possible to compute momentum between runs.
"""

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import polars as pl

from .config import DB_PATH


def init_db(db_path: Path = DB_PATH) -> sqlite3.Connection:
    con = sqlite3.connect(db_path)
    con.execute("""
        CREATE TABLE IF NOT EXISTS snapshots (
            id        INTEGER,
            stars     INTEGER,
            captured  TEXT
        )
    """)
    con.commit()
    return con


def previous_snapshot(con: sqlite3.Connection) -> pl.DataFrame:
    """Return the most recent snapshot per repo (to compare momentum)."""
    rows = con.execute("""
        SELECT s.id, s.stars, s.captured
        FROM snapshots s
        JOIN (SELECT id, MAX(captured) mx FROM snapshots GROUP BY id) last
          ON s.id = last.id AND s.captured = last.mx
    """).fetchall()
    if not rows:
        return pl.DataFrame(
            schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8}
        )
    return pl.DataFrame(rows, schema=["id", "prev_stars", "prev_time"], orient="row")


def save_snapshot(con: sqlite3.Connection, df: pl.DataFrame) -> None:
    now = datetime.now(timezone.utc).isoformat()
    con.executemany(
        "INSERT INTO snapshots (id, stars, captured) VALUES (?, ?, ?)",
        [(r["id"], r["stars"], now) for r in df.iter_rows(named=True)],
    )
    con.commit()
