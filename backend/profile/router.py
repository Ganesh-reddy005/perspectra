"""
Profile router — /profile/me and /profile/onboarding
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth.utils import get_current_user
from profile.service import get_profile, update_profile
from llm.client import llm
from prompts.loader import load_prompt

router = APIRouter(prefix="/profile", tags=["profile"])


class OnboardingRequest(BaseModel):
    answers: dict  # {"q1": "...", "q2": "...", ...}


class ProfileUpdateRequest(BaseModel):
    experience_level: Optional[str] = None
    preferred_style: Optional[str] = None
    goal: Optional[str] = None
    background: Optional[str] = None
    known_concepts: Optional[list] = None


ONBOARDING_QUESTIONS = [
    "What is your current experience level with programming? (Beginner / Intermediate / Advanced)",
    "Which DSA topics have you studied before? List all you remember.",
    "Which topics do you find most challenging or confusing?",
    "What is your main goal? (e.g., crack coding interviews, learn CS fundamentals, competitive programming)",
    "Tell us anything else about yourself — your background, what you've tried before, or what you expect from Perspectra.",
]


@router.get("/onboarding/questions")
async def get_questions():
    return {"questions": ONBOARDING_QUESTIONS}


@router.post("/onboarding")
async def submit_onboarding(payload: OnboardingRequest, user: dict = Depends(get_current_user)):
    user_id = user["sub"]

    prompt = f"""Student onboarding answers:
{chr(10).join(f'Q{i+1}: {ONBOARDING_QUESTIONS[i]}{chr(10)}A{i+1}: {ans}' for i, (_, ans) in enumerate(payload.answers.items()))}

Analyze and return the JSON profile inference."""

    try:
        inferred = await llm.complete_json(prompt, system=load_prompt("onboarding"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM inference failed: {e}")

    updates = {
        "onboarding_complete": True,
        "onboarding_answers": payload.answers,
        "experience_level": inferred.get("experience_level", "beginner"),
        "skill_level": inferred.get("skill_level", inferred.get("experience_level", "beginner")),
        "preferred_style": inferred.get("preferred_style", "visual"),
        "background": inferred.get("background", ""),
        "goal": inferred.get("goal", ""),
        "skills": inferred.get("initial_skills", {}),
        "gaps": inferred.get("initial_gaps", []),
        "strengths": inferred.get("initial_strengths", []),
        "known_concepts": inferred.get("known_concepts", []),
        # Initialise fields used by agents
        "recent_weaknesses": [],
        "mistake_patterns": [],
        "recent_hints": [],
        "thinking_style": "unknown",
        "submissions_count": 0,
    }
    profile = await update_profile(user_id, updates)
    return {"message": "Onboarding complete", "profile": profile}


@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    profile = await get_profile(user["sub"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me")
async def patch_my_profile(payload: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    """Partial profile update — no LLM call, plain field overrides."""
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    profile = await update_profile(user["sub"], updates)
    return profile
