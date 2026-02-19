"""
Prompt loader — reads system prompts from backend/prompts/*.md

Two modes:
  - Production (HOT_RELOAD_PROMPTS != "1"): cache prompts in memory after first load.
  - Dev / testing (HOT_RELOAD_PROMPTS=1): re-read from disk on every call so you can
    edit a .md file and immediately see the effect without restarting the server.

Usage:
    from prompts.loader import load_prompt
    system = load_prompt("reviewer")   # reads prompts/reviewer.md
"""

import os

_PROMPTS_DIR = os.path.dirname(__file__)
_cache: dict[str, str] = {}

# Set HOT_RELOAD_PROMPTS=1 in your .env to disable caching during development
_HOT_RELOAD = os.getenv("HOT_RELOAD_PROMPTS", "0") == "1"


def load_prompt(name: str) -> str:
    """
    Load a system prompt from backend/prompts/<name>.md.

    In production: the result is cached in memory after the first read.
    In dev (HOT_RELOAD_PROMPTS=1): re-reads from disk every time — no restart needed
    when you edit a prompt file and want to test the change immediately.
    """
    if not _HOT_RELOAD and name in _cache:
        return _cache[name]

    path = os.path.join(_PROMPTS_DIR, f"{name}.md")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Prompt file not found: {path}\n"
            f"Create backend/prompts/{name}.md to define this prompt."
        )

    with open(path, "r", encoding="utf-8") as f:
        content = f.read().strip()

    if not _HOT_RELOAD:
        _cache[name] = content

    return content


def invalidate_cache(name: str | None = None) -> None:
    """
    Manually invalidate the prompt cache.
    Call with no args to clear all, or pass a name to clear just one.
    Useful in tests.
    """
    global _cache
    if name is None:
        _cache = {}
    else:
        _cache.pop(name, None)
