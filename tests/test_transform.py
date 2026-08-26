"""
Tests for the TRANSFORM layer (momentum calculation).

`compute_momentum` is pure logic (no I/O), so we test it directly: feed it
input DataFrames and assert on the derived columns.
"""

from datetime import datetime, timedelta, timezone

import polars as pl
import pytest

from ai_radar import (
    compute_momentum,
    EMERGING_MIN_MOMENTUM,
    EMERGING_MIN_STARS,
)


def _iso_hours_ago(hours: float) -> str:
    """ISO timestamp `hours` hours in the past (as a snapshot stores it)."""
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def _current(rows: list[dict]) -> pl.DataFrame:
    """Build the 'current' DataFrame with the minimal schema transform uses."""
    return pl.DataFrame(rows, schema={"id": pl.Int64, "stars": pl.Int64})


def _empty_previous() -> pl.DataFrame:
    return pl.DataFrame(
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8}
    )


def test_first_run_has_no_momentum():
    """No previous snapshot: nothing to compare against -> nothing emerges."""
    current = _current([{"id": 1, "stars": 500}])

    out = compute_momentum(current, _empty_previous())
    row = out.row(0, named=True)

    assert row["stars_gained"] is None
    assert row["stars_per_hour"] is None
    assert row["emerging"] is False


def test_computes_stars_gained_and_momentum():
    """Repo that gained 80★ in 10h -> 8.0 ★/h."""
    current = _current([{"id": 1, "stars": 200}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 120, "prev_time": _iso_hours_ago(10)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_gained"] == 80
    assert row["stars_per_hour"] == pytest.approx(8.0, abs=0.05)


def test_high_momentum_repo_is_flagged_emerging():
    """Crosses both thresholds (momentum and stars) -> emerging=True."""
    current = _current([{"id": 1, "stars": EMERGING_MIN_STARS + 100}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": EMERGING_MIN_STARS, "prev_time": _iso_hours_ago(1)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] >= EMERGING_MIN_MOMENTUM
    assert row["emerging"] is True


def test_slow_repo_is_not_emerging():
    """Lots of stars but slow growth -> does not emerge."""
    current = _current([{"id": 1, "stars": 5000}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 4998, "prev_time": _iso_hours_ago(10)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] < EMERGING_MIN_MOMENTUM
    assert row["emerging"] is False


def test_fast_growth_but_too_few_stars_is_not_emerging():
    """High momentum but no traction yet (few stars) -> does not emerge."""
    current = _current([{"id": 1, "stars": EMERGING_MIN_STARS - 1}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 0, "prev_time": _iso_hours_ago(1)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] >= EMERGING_MIN_MOMENTUM
    assert row["emerging"] is False


def test_emerging_repos_are_sorted_first():
    """The ranking sorts by momentum descending (emerging repos on top)."""
    current = _current([
        {"id": 1, "stars": 300},   # +150 in 10h -> 15 ★/h
        {"id": 2, "stars": 300},   # +10  in 10h -> 1  ★/h
    ])
    previous = pl.DataFrame(
        [
            {"id": 1, "prev_stars": 150, "prev_time": _iso_hours_ago(10)},
            {"id": 2, "prev_stars": 290, "prev_time": _iso_hours_ago(10)},
        ],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    out = compute_momentum(current, previous)

    assert out.row(0, named=True)["id"] == 1
    assert out.row(1, named=True)["id"] == 2
