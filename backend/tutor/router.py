"""
Tutor router — /tutor/ask and /tutor/hint
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from auth.utils import get_current_user
from db.mongo import get_db
from profile.service import get_profile, update_profile
from agents.tutor import run_tutor, run_hint

router = APIRouter(prefix="/tutor", tags=["tutor"])


class ConversationMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class AskRequest(BaseModel):
    problem_id: str
    question: str
    conversation_history: Optional[list[ConversationMessage]] = None


class HintRequest(BaseModel):
    problem_id: str
    current_code: Optional[str] = None     # student's current code snapshot


@router.post("/ask")
async def ask_tutor(payload: AskRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    problem = await db.problems.find_one({"id": payload.problem_id}, {"_id": 0})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    profile = await get_profile(user["sub"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    history = (
        [{"role": m.role, "content": m.content} for m in payload.conversation_history]
        if payload.conversation_history
        else None
    )

    response = await run_tutor(
        user_question=payload.question,
        problem=problem,
        profile=profile,
        conversation_history=history,
    )
    return {"response": response}


@router.post("/hint")
async def get_hint(payload: HintRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    problem = await db.problems.find_one({"id": payload.problem_id}, {"_id": 0})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    profile = await get_profile(user["sub"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    previous_hints = profile.get("recent_hints", [])
    if isinstance(previous_hints, str):
        # Older schema stored a single string — normalise
        previous_hints = [previous_hints] if previous_hints else []

    hint = await run_hint(
        problem=problem,
        profile=profile,
        previous_hints=previous_hints,
        current_code=payload.current_code,
    )

    # Append new hint to profile's recent_hints (cap at 20)
    updated_hints = previous_hints + [hint]
    await update_profile(user["sub"], {"recent_hints": updated_hints[-20:]})

    return {"hint": hint}
