"""
Background Agent — Async summarizer, runs every 5 submissions.
Performs: review summarization, skill trend analysis, insight generation.
"""

from datetime import datetime, timezone
from llm.client import llm
from db.mongo import get_db
from profile.service import get_profile, update_profile
from prompts.loader import load_prompt


async def run_background_agent(user_id: str):
    """
    Run background summarization for a user.
    Should be triggered every 5 submissions via FastAPI BackgroundTasks.
    """
    db = get_db()
    profile = await get_profile(user_id)
    if not profile:
        return

    # Fetch last 10 reviews for this user
    cursor = db.reviews.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10)
    reviews = await cursor.to_list(length=10)

    if not reviews:
        return

    # Build summary context
    reviews_text = "\n\n".join([
        f"=== Review {i+1} (Problem: {r.get('problem_title','?')}) ===\n"
        f"Strengths: {r.get('strengths', [])}\n"
        f"Gaps: {r.get('concept_gaps', [])}\n"
        f"Weaknesses: {r.get('weaknesses', [])}\n"
        f"Mistake Patterns: {r.get('profile_updates', {}).get('mistake_patterns', [])}"
        for i, r in enumerate(reviews)
    ])

    system = load_prompt("background")

    prompt = f"""## Student Profile
Level: {profile.get('experience_level', 'beginner')}
Current Skills: {profile.get('skills', {})}
Current Gaps: {profile.get('gaps', [])}
Total Submissions: {profile.get('submissions_count', 0)}

## Last Reviews
{reviews_text}

Generate the learning insights JSON."""

    try:
        insights = await llm.complete_json(prompt, system=system, temperature=0.3)
    except Exception as e:
        print(f"[Background Agent] LLM call failed for user {user_id}: {e}")
        return

    # Store insights in profile
    await update_profile(user_id, {
        "insights": insights,
        "last_summarized_at": profile.get("submissions_count", 0),
    })
    print(f"[Background Agent] Insights updated for user {user_id}")
