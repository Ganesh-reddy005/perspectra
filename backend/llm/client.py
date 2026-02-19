"""
Unified LLM Client — Perspectra
Supports OpenRouter, Groq, and any OpenAI-compatible provider.
Falls back automatically if the primary provider fails.
"""

import json
import logging
from typing import Any
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config import get_settings

logger = logging.getLogger(__name__)

PROVIDER_CONFIGS = {
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "api_key_field": "openrouter_api_key",
        "extra_headers": {
            "HTTP-Referer": "https://perspectra.app",
            "X-Title": "Perspectra",
        },
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key_field": "groq_api_key",
        "extra_headers": {},
    },
    "openai": {
        "base_url": "https://api.openai.com/v1",
        "api_key_field": "openai_api_key",
        "extra_headers": {},
    },
}


def _build_client(provider: str) -> AsyncOpenAI:
    settings = get_settings()
    cfg = PROVIDER_CONFIGS[provider]
    api_key = getattr(settings, cfg["api_key_field"])
    return AsyncOpenAI(
        api_key=api_key,
        base_url=cfg["base_url"],
        default_headers=cfg.get("extra_headers", {}),
    )


class LLMClient:
    """
    Single entry point for all LLM calls in Perspectra.

    Usage:
        client = LLMClient()
        text = await client.complete("Explain recursion", system="You are a tutor")
        data = await client.complete_json("Analyze this code", system="...", schema_hint="...")
    """

    def __init__(self):
        self.settings = get_settings()

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        reraise=False,
    )
    async def _call(
        self,
        provider: str,
        model: str,
        messages: list[dict],
        json_mode: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        client = _build_client(provider)
        kwargs: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    async def complete(
        self,
        prompt: str,
        system: str = "You are a helpful assistant.",
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """Plain text completion with automatic fallback."""
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ]
        settings = self.settings
        try:
            return await self._call(
                provider=settings.llm_provider,
                model=settings.llm_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as e:
            logger.warning(f"Primary LLM [{settings.llm_provider}] failed: {e}. Falling back to [{settings.llm_fallback_provider}]")
            return await self._call(
                provider=settings.llm_fallback_provider,
                model=settings.llm_fallback_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

    async def complete_json(
        self,
        prompt: str,
        system: str = "You are a helpful assistant. Always respond with valid JSON.",
        temperature: float = 0.3,
        max_tokens: int = 3000,
    ) -> dict:
        """
        JSON-mode completion. Returns a parsed dict.
        Falls back to text parsing if provider doesn't support json_mode.
        """
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ]
        settings = self.settings

        async def attempt(provider: str, model: str) -> dict:
            try:
                raw = await self._call(
                    provider=provider,
                    model=model,
                    messages=messages,
                    json_mode=True,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception:
                # Some providers don't support json_mode, retry without
                raw = await self._call(
                    provider=provider,
                    model=model,
                    messages=messages,
                    json_mode=False,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            # Extract JSON from response
            return _extract_json(raw)

        try:
            return await attempt(settings.llm_provider, settings.llm_model)
        except Exception as e:
            logger.warning(f"Primary JSON call failed: {e}. Falling back.")
            return await attempt(settings.llm_fallback_provider, settings.llm_fallback_model)


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM output, handling markdown code fences."""
    text = text.strip()
    # Strip ```json ... ``` fences
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
    return json.loads(text)


# Singleton — import and use anywhere
llm = LLMClient()
