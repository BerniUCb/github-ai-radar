"""
GitHub AI Radar
================
Detecta repositorios de IA emergentes en GitHub y mide su "momentum"
(estrellas ganadas entre corridas) para cazarlos ANTES de que exploten.

Cómo funciona:
  1. Consulta el Search API de GitHub filtrando por topics de IA y fecha de creación.
  2. Guarda un snapshot de las estrellas de cada repo con su timestamp.
  3. En la siguiente corrida, compara contra el snapshot anterior y calcula
     estrellas ganadas y estrellas/hora (momentum).
  4. Marca como EMERGING los repos que rompen umbrales de crecimiento.
  5. Exporta un ranking limpio a CSV (listo pa vender o mostrar en portafolio).

Uso:
  python ai_radar.py                 # corrida normal
  python ai_radar.py --days 14       # repos creados en los ultimos 14 dias
  python ai_radar.py --token TU_PAT  # con token: 5000 req/h en vez de 60

Sin token funciona, pero GitHub te limita a 60 peticiones/hora.
Con un Personal Access Token (gratis) subis a 5000/hora.
"""

import argparse
import json
import sqlite3
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import polars as pl

# -------------------------------------------------------------------------
# CONFIG
# -------------------------------------------------------------------------

# Topics de IA que estan calientes ahora. Agrega/quita segun tu nicho.
AI_TOPICS = [
    "llm",
    "ai-agents",
    "rag",
    "mcp",
    "generative-ai",
    "llm-inference",
    "agentic-ai",
]

DB_PATH = Path("radar.db")          # historial de snapshots
OUTPUT_CSV = Path("ai_radar_report.csv")
API = "https://api.github.com/search/repositories"

# Umbrales para marcar un repo como "emergiendo"
EMERGING_MIN_MOMENTUM = 5.0   # estrellas por hora
EMERGING_MIN_STARS = 50       # que ya tenga algo de traccion


# -------------------------------------------------------------------------
# EXTRACT  (scraping via API)
# -------------------------------------------------------------------------

def build_headers(token: str | None) -> dict:
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def fetch_topic(topic: str, since: str, headers: dict, per_page: int = 30) -> list[dict]:
    """Trae los repos mas estrellados de un topic creados despues de `since`."""
    params = {
        "q": f"topic:{topic} created:>{since}",
        "sort": "stars",
        "order": "desc",
        "per_page": per_page,
    }
    r = requests.get(API, headers=headers, params=params, timeout=30)

    # Respeta el rate limit: si quedan 0 peticiones, espera.
    if r.status_code == 403 and r.headers.get("X-RateLimit-Remaining") == "0":
        reset = int(r.headers.get("X-RateLimit-Reset", 0))
        wait = max(reset - time.time(), 0) + 1
        print(f"  [rate limit] esperando {wait:.0f}s...")
        time.sleep(wait)
        r = requests.get(API, headers=headers, params=params, timeout=30)

    r.raise_for_status()
    return r.json().get("items", [])


def collect(days: int, token: str | None) -> pl.DataFrame:
    """Recolecta y deduplica repos de todos los topics de IA."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    headers = build_headers(token)
    seen: dict[int, dict] = {}

    for topic in AI_TOPICS:
        print(f"  scraping topic: {topic}")
        for repo in fetch_topic(topic, since, headers):
            rid = repo["id"]
            if rid not in seen:  # dedup: un repo puede estar en varios topics
                seen[rid] = {
                    "id": rid,
                    "full_name": repo["full_name"],
                    "url": repo["html_url"],
                    "stars": repo["stargazers_count"],
                    "language": repo.get("language") or "",
                    "description": (repo.get("description") or "")[:140],
                    "created_at": repo["created_at"],
                    "topic_hit": topic,
                }
        time.sleep(1)  # se amable con el API

    df = pl.DataFrame(list(seen.values()))
    print(f"  -> {len(df)} repos unicos recolectados")
    return df


# -------------------------------------------------------------------------
# LOAD  (snapshots historicos en SQLite)
# -------------------------------------------------------------------------

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS snapshots (
            id        INTEGER,
            stars     INTEGER,
            captured  TEXT
        )
    """)
    con.commit()
    return con


def previous_snapshot(con) -> pl.DataFrame:
    """Devuelve el snapshot mas reciente por repo (para comparar momentum)."""
    rows = con.execute("""
        SELECT s.id, s.stars, s.captured
        FROM snapshots s
        JOIN (SELECT id, MAX(captured) mx FROM snapshots GROUP BY id) last
          ON s.id = last.id AND s.captured = last.mx
    """).fetchall()
    if not rows:
        return pl.DataFrame(schema={"id": pl.Int64, "prev_stars": pl.Int64, "prev_time": pl.Utf8})
    return pl.DataFrame(rows, schema=["id", "prev_stars", "prev_time"], orient="row")


def save_snapshot(con, df: pl.DataFrame):
    now = datetime.now(timezone.utc).isoformat()
    con.executemany(
        "INSERT INTO snapshots (id, stars, captured) VALUES (?, ?, ?)",
        [(r["id"], r["stars"], now) for r in df.iter_rows(named=True)],
    )
    con.commit()


# -------------------------------------------------------------------------
# TRANSFORM  (calcular momentum con Polars)
# -------------------------------------------------------------------------

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

    # Marca los emergentes
    df = df.with_columns([
        (
            (pl.col("stars_per_hour") >= EMERGING_MIN_MOMENTUM)
            & (pl.col("stars") >= EMERGING_MIN_STARS)
        ).fill_null(False).alias("emerging"),
    ])

    # Ordena: primero los de mas momentum, luego los de mas estrellas
    return df.sort(
        ["stars_per_hour", "stars"], descending=[True, True], nulls_last=True
    )


# -------------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="GitHub AI Radar")
    ap.add_argument("--days", type=int, default=30, help="antiguedad max de los repos")
    ap.add_argument("--token", default=None, help="GitHub Personal Access Token (opcional)")
    args = ap.parse_args()

    print("== GitHub AI Radar ==")
    print("[1/4] Recolectando repos de IA...")
    current = collect(args.days, args.token)

    print("[2/4] Cargando historial...")
    con = init_db()
    previous = previous_snapshot(con)
    first_run = previous.height == 0
    if first_run:
        print("  (primera corrida: sin momentum todavia, corre de nuevo mas tarde)")

    print("[3/4] Calculando momentum...")
    report = compute_momentum(current, previous)

    print("[4/4] Guardando snapshot y exportando...")
    save_snapshot(con, current)
    con.close()

    out = report.select([
        "full_name", "stars", "stars_gained", "stars_per_hour",
        "emerging", "language", "topic_hit", "description", "url",
    ])
    out.write_csv(OUTPUT_CSV)

    # Resumen en consola
    emerging = out.filter(pl.col("emerging"))
    print(f"\nListo -> {OUTPUT_CSV}  ({out.height} repos)")
    if not first_run and emerging.height:
        print(f"\n🚀 {emerging.height} repos EMERGIENDO:")
        for r in emerging.head(10).iter_rows(named=True):
            print(f"   {r['stars_per_hour']:.1f}★/h  {r['full_name']}  ({r['stars']}★)")
    else:
        print("\nTop por estrellas ahora:")
        for r in out.head(10).iter_rows(named=True):
            print(f"   {r['stars']:>6}★  {r['full_name']}")


if __name__ == "__main__":
    main()
