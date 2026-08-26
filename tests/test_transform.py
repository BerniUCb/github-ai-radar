"""
Tests de la capa de TRANSFORM (cálculo de momentum).

`compute_momentum` es lógica pura (sin I/O), así que se testea directo:
le pasamos DataFrames de entrada y verificamos las columnas derivadas.
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
    """Timestamp ISO de hace `hours` horas (como lo guarda el snapshot)."""
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def _current(rows: list[dict]) -> pl.DataFrame:
    """Construye el DataFrame 'actual' con el esquema mínimo que usa transform."""
    return pl.DataFrame(rows, schema={"id": pl.Int64, "stars": pl.Int64})


def _empty_previous() -> pl.DataFrame:
    return pl.DataFrame(
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8}
    )


def test_first_run_has_no_momentum():
    """Sin snapshot previo: no hay con qué comparar → nada emerge."""
    current = _current([{"id": 1, "stars": 500}])

    out = compute_momentum(current, _empty_previous())
    row = out.row(0, named=True)

    assert row["stars_gained"] is None
    assert row["stars_per_hour"] is None
    assert row["emerging"] is False


def test_computes_stars_gained_and_momentum():
    """Repo que ganó 80★ en 10h → 8.0 ★/h."""
    current = _current([{"id": 1, "stars": 200}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 120, "prev_time": _iso_hours_ago(10)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_gained"] == 80
    assert row["stars_per_hour"] == pytest.approx(8.0, abs=0.05)


def test_high_momentum_repo_is_flagged_emerging():
    """Cruza ambos umbrales (momentum y estrellas) → emerging=True."""
    current = _current([{"id": 1, "stars": EMERGING_MIN_STARS + 100}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": EMERGING_MIN_STARS, "prev_time": _iso_hours_ago(1)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] >= EMERGING_MIN_MOMENTUM
    assert row["emerging"] is True


def test_slow_repo_is_not_emerging():
    """Muchas estrellas pero crecimiento lento → no emerge."""
    current = _current([{"id": 1, "stars": 5000}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 4998, "prev_time": _iso_hours_ago(10)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] < EMERGING_MIN_MOMENTUM
    assert row["emerging"] is False


def test_fast_growth_but_too_few_stars_is_not_emerging():
    """Momentum alto pero aún sin tracción (pocas estrellas) → no emerge."""
    current = _current([{"id": 1, "stars": EMERGING_MIN_STARS - 1}])
    previous = pl.DataFrame(
        [{"id": 1, "prev_stars": 0, "prev_time": _iso_hours_ago(1)}],
        schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8},
    )

    row = compute_momentum(current, previous).row(0, named=True)

    assert row["stars_per_hour"] >= EMERGING_MIN_MOMENTUM
    assert row["emerging"] is False


def test_emerging_repos_are_sorted_first():
    """El ranking ordena por momentum descendente (emergentes arriba)."""
    current = _current([
        {"id": 1, "stars": 300},   # +150 en 10h → 15 ★/h
        {"id": 2, "stars": 300},   # +10  en 10h → 1  ★/h
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
