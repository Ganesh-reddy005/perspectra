"""
Profile service — create and update Dynamic Profiles.
"""

from datetime import datetime, timezone
from db.mongo import get_db
from db.neo4j import run_query


def _empty_profile(user_id: str) -> dict:
    """Returns a blank profile document."""
    return {
        "user_id": user_id,
        "onboarding_complete": False,
        "onboarding_answers": {},
        "experience_level": "beginner",   # beginner | intermediate | advanced
        "preferred_style": "visual",       # visual | verbal | example-based | conceptual
        "skills": {},                      # {"Arrays": 0.0, ...}  0.0-1.0
        "gaps": [],                        # concept names with gaps
        "strengths": [],                   # concept names that are strong
        "mistake_patterns": [],            # ["off-by-one", "missing base case", ...]
        "recent_hints": [],                # last 5 hints given by Tutor
        "submissions_count": 0,
        "last_summarized_at": 0,           # submission count at last background run
        "insights": None,                  # from Background Agent
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


async def create_initial_profile(user_id: str) -> dict:
    db = get_db()
    profile = _empty_profile(user_id)
    await db.profiles.insert_one(profile)
    return profile


async def get_profile(user_id: str) -> dict | None:
    db = get_db()
    return await db.profiles.find_one({"user_id": user_id}, {"_id": 0})


async def update_profile(user_id: str, updates: dict) -> dict:
    """
    Merge `updates` into the user profile document.
    Special keys handled: skills (dict merge), gaps/strengths (list replace), 
    mistake_patterns (append unique), recent_hints (append, keep last 5).
    """
    db = get_db()
    profile = await get_profile(user_id)
    if not profile:
        profile = _empty_profile(user_id)
        await db.profiles.insert_one({**profile})

    set_ops: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    push_ops: dict = {}

    for key, value in updates.items():
        if key == "skills" and isinstance(value, dict):
            # Merge skill scores — take the new value only if it changed significantly
            for concept, score in value.items():
                set_ops[f"skills.{concept}"] = round(float(score), 2)
        elif key == "gaps" and isinstance(value, list):
            set_ops["gaps"] = value
        elif key == "strengths" and isinstance(value, list):
            set_ops["strengths"] = value
        elif key == "mistake_patterns" and isinstance(value, list):
            # Append new patterns without duplicates
            current = profile.get("mistake_patterns", [])
            merged = list(dict.fromkeys(current + value))  # preserve order, dedupe
            set_ops["mistake_patterns"] = merged[-20:]     # keep last 20
        elif key == "recent_hints" and isinstance(value, str):
            current = profile.get("recent_hints", [])
            set_ops["recent_hints"] = (current + [value])[-5:]
        else:
            set_ops[key] = value

    await db.profiles.update_one({"user_id": user_id}, {"$set": set_ops})

    # Sync gaps/strengths to Neo4j as HAS_GAP / HAS_SKILL edges
    if "gaps" in updates or "skills" in updates:
        await _sync_skills_to_neo4j(user_id, updates)

    return await get_profile(user_id)


async def _sync_skills_to_neo4j(user_id: str, updates: dict):
    """Write HAS_SKILL and HAS_GAP edges to Neo4j for the knowledge graph."""
    # Ensure Student node exists
    await run_query(
        "MERGE (s:Student {id: $uid})",
        {"uid": user_id}
    )

    if "skills" in updates:
        for concept_name, score in updates["skills"].items():
            await run_query("""
                MATCH (s:Student {id: $uid}), (c:Concept {name: $name})
                MERGE (s)-[r:HAS_SKILL]->(c)
                SET r.level = $level, r.updated_at = $ts
            """, {
                "uid": user_id,
                "name": concept_name,
                "level": float(score),
                "ts": datetime.now(timezone.utc).isoformat()
            })

    if "gaps" in updates:
        for concept_name in updates["gaps"]:
            await run_query("""
                MATCH (s:Student {id: $uid}), (c:Concept {name: $name})
                MERGE (s)-[r:HAS_GAP]->(c)
                SET r.since = $ts
            """, {
                "uid": user_id,
                "name": concept_name,
                "ts": datetime.now(timezone.utc).isoformat()
            })
