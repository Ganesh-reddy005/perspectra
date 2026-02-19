"""
Reviewer Agent — Perspectra's most important AI agent.

Extracts rich learning signals from a code submission:
  - Correctness & efficiency analysis
  - Thinking style inference
  - Concept gap mapping
  - Personalised Socratic feedback
  - Profile update deltas
"""

import logging
from llm.client import llm
from prompts.loader import load_prompt

logger = logging.getLogger(__name__)


def _build_reviewer_context(problem: dict, user_code: str, profile: dict, language: str) -> str:
    """
    Build the richest possible personalisation context for the reviewer.
    Every field from the dynamic profile that helps the LLM tailor its analysis
    and feedback is included here so the prompt template never needs to change.
    """
    skills = profile.get("skills", {})
    # Top 8 skills by score — most signal-rich
    top_skills = sorted(skills.items(), key=lambda x: x[1], reverse=True)[:8]
    top_skills_str = ", ".join(f"{k}: {v:.2f}" for k, v in top_skills) or "None yet"

    # Infer learning velocity from submissions count (simple heuristic)
    submissions = profile.get("submissions_count", 0)
    if submissions < 5:
        velocity = "slow (early stage)"
    elif submissions < 20:
        velocity = "normal"
    else:
        velocity = "fast (experienced user)"

    return f"""## PERSONALISATION PROFILE
Experience Level:    {profile.get('experience_level', 'beginner')}
Skill Level:         {profile.get('skill_level', profile.get('experience_level', 'beginner'))}
Learning Velocity:   {velocity} ({submissions} submissions so far)
Preferred Style:     {profile.get('preferred_style', 'visual')}
Background:          {profile.get('background', 'Not specified')}
Goal:                {profile.get('goal', 'General DSA mastery')}
Prior Thinking Style: {profile.get('thinking_style', 'unknown')}

Known Strengths:     {', '.join(profile.get('strengths', [])) or 'None identified yet'}
Known Gaps:          {', '.join(profile.get('gaps', [])) or 'None identified yet'}
Recurring Mistakes:  {', '.join(profile.get('mistake_patterns', [])) or 'None identified yet'}
Recent Weaknesses:   {', '.join(profile.get('recent_weaknesses', [])) or 'None identified yet'}
Known Concepts:      {', '.join(profile.get('known_concepts', [])) or 'Not specified'}
Top Skill Scores:    {top_skills_str}

Onboarding Context:  {profile.get('onboarding_summary', 'Not available')}

## PROBLEM
Title:       {problem.get('title', 'Unknown')}
Description: {problem.get('description', '')}
Difficulty:  {problem.get('difficulty', 'unknown')}
Concepts:    {', '.join(problem.get('concept_ids', []))}
Constraints: {'; '.join(problem.get('constraints', [])) or 'None listed'}

## STUDENT SUBMISSION ({language})
```{language}
{user_code}
```

Perform your full internal analysis and return ONLY the JSON review object."""


async def run_reviewer(
    problem: dict,
    user_code: str,
    profile: dict,
    language: str = "python",
) -> dict:
    """
    Run the Reviewer Agent.

    Args:
        problem:   Full problem document from MongoDB
        user_code: Code submitted by the student
        profile:   Current Dynamic Profile of the student
        language:  Programming language used

    Returns:
        Structured review result dict matching the JSON schema in reviewer.md
    """
    system = load_prompt("reviewer")
    prompt = _build_reviewer_context(problem, user_code, profile, language)

    logger.info(
        "Running Reviewer for user=%s problem=%s lang=%s",
        profile.get("user_id", "?"),
        problem.get("id", "?"),
        language,
    )

    result = await llm.complete_json(prompt, system=system, temperature=0.2)

    # Ensure all expected keys are present with safe defaults
    result.setdefault("score", 0)
    result.setdefault("strengths", [])
    result.setdefault("weaknesses", [])
    result.setdefault("thinking_style", "brute_force")
    result.setdefault("concept_gaps", [])
    result.setdefault("known_concepts", [])
    result.setdefault("topics_to_revise", [])
    result.setdefault("detailed_feedback", "")
    result.setdefault("profile_updates", {})

    pu = result["profile_updates"]
    pu.setdefault("skills", {})
    pu.setdefault("gaps", [])
    pu.setdefault("strengths", [])
    pu.setdefault("mistake_patterns", [])

    return result
