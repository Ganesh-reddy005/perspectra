"""
Tutor Agent + Hint Agent — Socratic teaching engine.

Tutor: Responds to student questions with calibrated Socratic guidance.
Hint:  Generates a single progressive conceptual nudge.
"""

import logging
from llm.client import llm
from prompts.loader import load_prompt

logger = logging.getLogger(__name__)


def _build_tutor_context(
    user_question: str,
    problem: dict,
    profile: dict,
    conversation_history: list[dict] | None = None,
) -> str:
    """
    Build the full personalisation context for the Socratic tutor.
    Includes conversation history so the tutor can build progressively.
    """
    # Infer session depth from recent hints (proxy for conversation depth)
    hints_given = len(profile.get("recent_hints", []))
    session_depth = "early" if hints_given < 2 else "mid" if hints_given < 5 else "deep"

    history_str = "None yet."
    if conversation_history:
        history_str = "\n".join(
            f"  [{m['role'].upper()}]: {m['content']}"
            for m in conversation_history[-6:]  # last 3 exchanges
        )

    return f"""## PERSONALISATION PROFILE
Experience Level:   {profile.get('experience_level', 'beginner')}
Preferred Style:    {profile.get('preferred_style', 'visual')}
Thinking Style:     {profile.get('thinking_style', 'unknown')}
Background:         {profile.get('background', 'Not specified')}
Goal:               {profile.get('goal', 'General DSA mastery')}
Learning Velocity:  {'fast' if profile.get('submissions_count', 0) > 20 else 'normal' if profile.get('submissions_count', 0) > 5 else 'slow'}

Known Strengths:    {', '.join(profile.get('strengths', [])) or 'None yet'}
Known Gaps:         {', '.join(profile.get('gaps', [])) or 'None yet'}
Mistake Patterns:   {', '.join(profile.get('mistake_patterns', [])) or 'None yet'}
Recent Weaknesses:  {', '.join(profile.get('recent_weaknesses', [])) or 'None yet'}
Known Concepts:     {', '.join(profile.get('known_concepts', [])) or 'Not specified'}
Session Depth:      {session_depth} (hints given this problem: {hints_given})

## PROBLEM CONTEXT
Title:       {problem.get('title', 'Unknown')}
Description: {problem.get('description', '')}
Concepts:    {', '.join(problem.get('concept_ids', []))}

## CONVERSATION HISTORY (last exchanges)
{history_str}

## STUDENT'S CURRENT QUESTION
{user_question}

Respond as a Socratic tutor. Guide, never answer. End with exactly ONE question."""


def _build_hint_context(
    problem: dict,
    profile: dict,
    previous_hints: list[str],
    current_code: str | None = None,
) -> str:
    """
    Build hint context. Includes current code snapshot if available
    so hints can reference where the student actually is.
    """
    prev_hints_str = (
        "\n".join(f"  {i+1}. {h}" for i, h in enumerate(previous_hints))
        if previous_hints
        else "  None given yet."
    )

    code_context = ""
    if current_code:
        # Only show first 30 lines to keep context tight
        lines = current_code.strip().splitlines()[:30]
        code_context = f"""
## STUDENT'S CURRENT CODE SNAPSHOT
```
{chr(10).join(lines)}
```
(calibrate hint to what they've already written — don't repeat what's already correct)"""

    return f"""## PERSONALISATION PROFILE
Experience Level:   {profile.get('experience_level', 'beginner')}
Thinking Style:     {profile.get('thinking_style', 'unknown')}
Known Gaps:         {', '.join(profile.get('gaps', [])) or 'None'}
Mistake Patterns:   {', '.join(profile.get('mistake_patterns', [])) or 'None'}
Recent Weaknesses:  {', '.join(profile.get('recent_weaknesses', [])) or 'None'}

## PROBLEM
Title:       {problem.get('title', 'Unknown')}
Description: {problem.get('description', '')}
Concepts:    {', '.join(problem.get('concept_ids', []))}
Constraints: {'; '.join(problem.get('constraints', [])) or 'None'}
{code_context}

## PREVIOUS HINTS (DO NOT REPEAT OR PARAPHRASE ANY OF THESE)
{prev_hints_str}

Generate ONE new Socratic hint that progresses beyond the above."""


async def run_tutor(
    user_question: str,
    problem: dict,
    profile: dict,
    conversation_history: list[dict] | None = None,
) -> str:
    """
    Socratic tutoring response to a student's question.

    Args:
        user_question:        The student's question text
        problem:              Full problem document from MongoDB
        profile:              Current Dynamic Profile of the student
        conversation_history: Optional recent message history for continuity
    """
    system = load_prompt("tutor")
    prompt = _build_tutor_context(user_question, problem, profile, conversation_history)

    logger.info(
        "Tutor called: user=%s problem=%s",
        profile.get("user_id", "?"),
        problem.get("id", "?"),
    )

    return await llm.complete(prompt, system=system, temperature=0.65, max_tokens=500)


async def run_hint(
    problem: dict,
    profile: dict,
    previous_hints: list[str],
    current_code: str | None = None,
) -> str:
    """
    Generate one targeted progressive Socratic hint.

    Args:
        problem:        Full problem document from MongoDB
        profile:        Current Dynamic Profile of the student
        previous_hints: All hints already given this session
        current_code:   Optional snapshot of student's current code
    """
    system = load_prompt("hint")
    prompt = _build_hint_context(problem, profile, previous_hints, current_code)

    logger.info(
        "Hint called: user=%s problem=%s previous=%d",
        profile.get("user_id", "?"),
        problem.get("id", "?"),
        len(previous_hints),
    )

    return await llm.complete(prompt, system=system, temperature=0.55, max_tokens=180)
