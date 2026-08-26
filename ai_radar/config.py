"""Central radar configuration: topics, paths, and thresholds."""

from pathlib import Path

# AI topics that are hot right now. Add/remove to fit your niche.
AI_TOPICS = [
    "llm",
    "ai-agents",
    "rag",
    "mcp",
    "generative-ai",
    "llm-inference",
    "agentic-ai",
]

DB_PATH = Path("radar.db")               # historical snapshots
OUTPUT_CSV = Path("ai_radar_report.csv")
API = "https://api.github.com/search/repositories"

# Thresholds to flag a repo as "emerging"
EMERGING_MIN_MOMENTUM = 5.0   # stars per hour
EMERGING_MIN_STARS = 50       # already has some traction
