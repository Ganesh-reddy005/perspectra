"""
Insights router + Problems router — /insights/me, /problems/list, /problems/:id
"""

from fastapi import APIRouter, Depends, HTTPException
from auth.utils import get_current_user
from profile.service import get_profile
from db.mongo import get_db

# Insights
insights_router = APIRouter(prefix="/insights", tags=["insights"])

@insights_router.get("/me")
async def get_my_insights(user: dict = Depends(get_current_user)):
    profile = await get_profile(user["sub"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "insights": profile.get("insights"),
        "submissions_count": profile.get("submissions_count", 0),
        "last_summarized_at": profile.get("last_summarized_at", 0),
    }


# Problems
problems_router = APIRouter(prefix="/problems", tags=["problems"])

@problems_router.get("/list")
async def list_problems(difficulty: int = None, concept_id: str = None):
    db = get_db()
    query: dict = {}
    if difficulty:
        query["difficulty"] = difficulty
    if concept_id:
        query["concept_ids"] = concept_id

    cursor = db.problems.find(query, {"_id": 0, "examples": 0}).sort("difficulty", 1)
    problems = await cursor.to_list(length=100)
    return {"problems": problems, "total": len(problems)}


@problems_router.get("/{problem_id}")
async def get_problem(problem_id: str):
    db = get_db()
    problem = await db.problems.find_one({"id": problem_id}, {"_id": 0})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
