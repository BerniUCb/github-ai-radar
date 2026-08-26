"""Tests for CLI helpers (token resolution)."""

from ai_radar.cli import resolve_token


def test_flag_takes_precedence_over_env(monkeypatch):
    monkeypatch.setenv("GITHUB_TOKEN", "from-env")
    assert resolve_token("from-flag") == "from-flag"


def test_falls_back_to_env_when_no_flag(monkeypatch):
    monkeypatch.setenv("GITHUB_TOKEN", "from-env")
    assert resolve_token(None) == "from-env"


def test_returns_none_when_nothing_set(monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    assert resolve_token(None) is None
