# 🛰️ GitHub AI Radar

Detects **emerging AI repositories** on GitHub and measures their *momentum*
(stars gained per hour between runs) to catch them **before** they blow up in
popularity.

In an ecosystem where hundreds of AI tools ship every week, knowing which ones
are growing fast — not which are already famous — is information that has value.
This project turns that signal into a clean, actionable CSV.

## Example output

![The scraper detecting emerging AI repositories in real time](output.png)

## What it does

1. **Extract** — queries the GitHub Search API filtering by AI *topics*
   (`llm`, `rag`, `ai-agents`, `mcp`, etc.) and recently created repos.
2. **Load** — saves a snapshot of each repo's stars with a timestamp in SQLite,
   building a history over time.
3. **Transform** — with **Polars**, compares the current run against the previous
   snapshot and computes stars gained and stars per hour (momentum).
4. **Report** — flags repos that break growth thresholds as `EMERGING` and
   exports a ranking to `ai_radar_report.csv`.

## Architecture

```
GitHub Search API  ──►  Extract  ──►  SQLite (historical snapshots)
                                          │
                                          ▼
                                  Transform (Polars)
                                  · stars_gained
                                  · stars_per_hour  (momentum)
                                  · emerging flag
                                          │
                                          ▼
                                  ai_radar_report.csv
```

It's a classic mini **ETL** pipeline: the value isn't in a one-off scrape, but in
running on a schedule and **accumulating history** — so momentum becomes more
accurate with every run.

## Project structure

Each ETL stage lives in its own module — `transform` is pure (no I/O), which
makes the momentum logic trivial to unit-test.

```
ai_radar/
  config.py      # topics, thresholds, paths
  extract.py     # GitHub Search API scraping
  storage.py     # SQLite snapshots (history)
  transform.py   # momentum calculation (pure, Polars)
  cli.py         # pipeline orchestration + argparse
tests/
  test_transform.py
```

Run the tests:

```bash
pip install -r requirements-dev.txt
pytest
```

## Usage

```bash
pip install -r requirements.txt

python -m ai_radar                 # repos from the last 30 days
python -m ai_radar --days 14       # shorter window = "fresher"
python -m ai_radar --token <PAT>   # optional token: 5000 req/h vs 60
```

> The **first** run only stores the baseline snapshot (nothing to compare against
> yet). From the **second** run onward, it computes momentum and detects emerging
> repos. Run it on a cron every few hours for better results.

### GitHub token (optional but recommended)

Without a token: 60 requests/hour. With a free
[Personal Access Token](https://github.com/settings/tokens) (no special scopes),
you get 5000/hour. The script respects the rate limit automatically.

## Automate (cron every 4 hours)

```cron
0 */4 * * * cd /path/github-ai-radar && python -m ai_radar --token <PAT>
```

## How it can be monetized

- **Weekly exports** of emerging AI repos sold on Gumroad / Lemon Squeezy to
  investors, developers, and tech newsletters.
- **API/dashboard** of AI trends as a micro-SaaS.
- **Custom trend-detection service** for funds or VCs.

## Stack

Python · Polars · SQLite · GitHub REST API

## Ideas for v2

- Enrich with commit/contributor data (development velocity).
- Anomaly detection to filter out star-farming (artificial growth).
- Email/Telegram alerts when a repo crosses the threshold.
- Dashboard with Streamlit or Next.js.
- Filter for "hidden gems": repos under X stars but accelerating fast.

---

*Portfolio project — data collection and analysis pipeline.
Respects the [GitHub Terms of Service](https://docs.github.com/site-policy)
and API limits.*
