"""
EXTRACT layer: scraping repos via the GitHub Search API.

Without a token GitHub caps you at 60 requests/hour; with a free Personal
Access Token (no special scopes) you get 5000/hour.
"""

import time
from datetime import datetime, timedelta, timezone

import polars as pl
import requests

from .config import AI_TOPICS, API


def build_headers(token: str | None) -> dict:
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def fetch_topic(topic: str, since: str, headers: dict, per_page: int = 30) -> list[dict]:
    """Fetch the most-starred repos for a topic created after `since`."""
    params = {
        "q": f"topic:{topic} created:>{since}",
        "sort": "stars",
        "order": "desc",
        "per_page": per_page,
    }
    r = requests.get(API, headers=headers, params=params, timeout=30)

    # Respect the rate limit: if no requests remain, wait until reset.
    if r.status_code == 403 and r.headers.get("X-RateLimit-Remaining") == "0":
        reset = int(r.headers.get("X-RateLimit-Reset", 0))
        wait = max(reset - time.time(), 0) + 1
        print(f"  [rate limit] waiting {wait:.0f}s...")
        time.sleep(wait)
        r = requests.get(API, headers=headers, params=params, timeout=30)

    r.raise_for_status()
    return r.json().get("items", [])


def collect(days: int, token: str | None) -> pl.DataFrame:
    """Collect and deduplicate repos across all AI topics."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    headers = build_headers(token)
    seen: dict[int, dict] = {}

    for topic in AI_TOPICS:
        print(f"  scraping topic: {topic}")
        for repo in fetch_topic(topic, since, headers):
            rid = repo["id"]
            if rid not in seen:  # dedup: a repo can appear under several topics
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
        time.sleep(1)  # be nice to the API

    df = pl.DataFrame(list(seen.values()))
    print(f"  -> {len(df)} unique repos collected")
    return df
