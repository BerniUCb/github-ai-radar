"""
TRANSFORM layer: momentum calculation with Polars.

Pure function (no I/O): takes the current and previous DataFrames and returns
the ranking with stars gained, stars per hour, and the `emerging` flag.
"""

from datetime import datetime, timezone

import polars as pl

from .config import EMERGING_MIN_MOMENTUM, EMERGING_MIN_STARS


def compute_momentum(current: pl.DataFrame, previous: pl.DataFrame) -> pl.DataFrame:
    now = datetime.now(timezone.utc)

    df = current.join(previous, on="id", how="left")

    def hours_since(t: str | None) -> float:
        if not t:
            return 0.0
        dt = datetime.fromisoformat(t)
        return max((now - dt).total_seconds() / 3600, 0.0)

    df = df.with_columns([
        (pl.col("stars") - pl.col("prev_stars")).alias("stars_gained"),
        pl.col("prev_time").map_elements(hours_since, return_dtype=pl.Float64).alias("hours_elapsed"),
    ])

    df = df.with_columns([
        pl.when(pl.col("hours_elapsed") > 0)
          .then(pl.col("stars_gained") / pl.col("hours_elapsed"))
          .otherwise(None)
          .alias("stars_per_hour"),
    ])

    # Flag the emerging repos
    df = df.with_columns([
        (
            (pl.col("stars_per_hour") >= EMERGING_MIN_MOMENTUM)
            & (pl.col("stars") >= EMERGING_MIN_STARS)
        ).fill_null(False).alias("emerging"),
    ])

    # Sort: highest momentum first, then most stars
    return df.sort(
        ["stars_per_hour", "stars"], descending=[True, True], nulls_last=True
    )
