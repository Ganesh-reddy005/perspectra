"""
Review router — /review/submit and /review/history
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel

from auth.utils import get_current_user
from db.mongo import get_db
from profile.service import get_profile, update_profile
from agents.reviewer import run_reviewer
from agents.background import run_background_agent

router = APIRouter(prefix="/review", tags=["review"])


class SubmitRequest(BaseModel):
    problem_id: str
    code: str
    language: str = "python"


@router.post("/submit")
async def submit_review(
    payload: SubmitRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    user_id = user["sub"]
    db = get_db()

    # Fetch problem
    problem = await db.problems.find_one({"id": payload.problem_id}, {"_id": 0})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Fetch profile
    profile = await get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Run Reviewer Agent
    try:
        review = await run_reviewer(problem, payload.code, profile, payload.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reviewer agent failed: {e}")

    # Persist review
    review_doc = {
        "user_id": user_id,
        "problem_id": payload.problem_id,
        "problem_title": problem["title"],
        "code": payload.code,
        "language": payload.language,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **review,
    }
    await db.reviews.insert_one(review_doc)

    # Update profile from review — merge profile_updates from LLM
    profile_updates = review.get("profile_updates", {})

    # Also persist high-signal fields from the review directly onto the profile
    # so every subsequent agent call gets richer context automatically
    if review.get("thinking_style"):
        profile_updates["thinking_style"] = review["thinking_style"]

    if review.get("concept_gaps"):
        # recent_weaknesses = last 10 unique gaps across submissions
        existing_weaknesses = profile.get("recent_weaknesses", [])
        merged = review["concept_gaps"] + [w for w in existing_weaknesses if w not in review["concept_gaps"]]
        profile_updates["recent_weaknesses"] = merged[:10]

    if review.get("known_concepts"):
        existing_known = set(profile.get("known_concepts", []))
        existing_known.update(review["known_concepts"])
        profile_updates["known_concepts"] = list(existing_known)

    if profile_updates:
        await update_profile(user_id, profile_updates)

    # Increment submission count
    new_count = profile.get("submissions_count", 0) + 1
    await update_profile(user_id, {"submissions_count": new_count})

    # Trigger background agent every 5 submissions
    if new_count % 5 == 0:
        background_tasks.add_task(run_background_agent, user_id)

    return {
        "score": review.get("score", 0),
        "strengths": review.get("strengths", []),
        "weaknesses": review.get("weaknesses", []),
        "concept_gaps": review.get("concept_gaps", []),
        "topics_to_revise": review.get("topics_to_revise", []),
        "thinking_style": review.get("thinking_style", ""),
        "detailed_feedback": review.get("detailed_feedback", ""),
        "known_concepts": review.get("known_concepts", []),
    }


@router.get("/history")
async def review_history(user: dict = Depends(get_current_user), limit: int = 10):
    db = get_db()
    cursor = db.reviews.find(
        {"user_id": user["sub"]},
        {"_id": 0, "code": 0}
    ).sort("created_at", -1).limit(limit)
    return {"reviews": await cursor.to_list(length=limit)}
