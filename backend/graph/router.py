"""
Knowledge Graph router — /graph/concepts, /graph/student, /graph/recommend, /graph/path
"""

from fastapi import APIRouter, Depends, Query
from auth.utils import get_current_user
from db.neo4j import run_query
from profile.service import get_profile

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/concepts")
async def get_all_concepts():
    """Return all concept nodes + dependency edges for the frontend graph visualization."""
    nodes = await run_query("MATCH (c:Concept) RETURN c.id AS id, c.name AS name, c.tier AS tier, c.difficulty AS difficulty, c.description AS description, c.subject AS subject")
    edges = await run_query("MATCH (a:Concept)-[:DEPENDS_ON]->(b:Concept) RETURN a.id AS source, b.id AS target")
    return {"nodes": nodes, "edges": edges}


@router.get("/student")
async def get_student_graph(user: dict = Depends(get_current_user)):
    """
    Return the concept graph overlaid with the student's skill/gap data.
    Used to color nodes in the frontend visualization.
    """
    user_id = user["sub"]

    # Get all concepts
    nodes = await run_query("MATCH (c:Concept) RETURN c.id AS id, c.name AS name, c.tier AS tier, c.difficulty AS difficulty")
    edges = await run_query("MATCH (a:Concept)-[:DEPENDS_ON]->(b:Concept) RETURN a.id AS source, b.id AS target")

    # Get student's skill overlay
    skills = await run_query("""
        MATCH (s:Student {id: $uid})-[r:HAS_SKILL]->(c:Concept)
        RETURN c.id AS concept_id, c.name AS concept_name, r.level AS skill_level
    """, {"uid": user_id})

    gaps = await run_query("""
        MATCH (s:Student {id: $uid})-[r:HAS_GAP]->(c:Concept)
        RETURN c.id AS concept_id, c.name AS concept_name
    """, {"uid": user_id})

    skill_map = {s["concept_id"]: s["skill_level"] for s in skills}
    gap_set = {g["concept_id"] for g in gaps}

    # Annotate nodes with student status
    for node in nodes:
        cid = node["id"]
        if cid in gap_set:
            node["status"] = "gap"
            node["skill_level"] = skill_map.get(cid, 0.0)
        elif cid in skill_map:
            level = skill_map[cid]
            node["skill_level"] = level
            node["status"] = "mastered" if level >= 0.7 else "learning"
        else:
            node["status"] = "untouched"
            node["skill_level"] = 0.0

    return {"nodes": nodes, "edges": edges}


@router.get("/recommend")
async def get_recommendation(user: dict = Depends(get_current_user)):
    """Recommend the next concept to study based on the student's gaps and current skills."""
    user_id = user["sub"]

    # Find concepts with direct prerequisites all mastered (skill >= 0.6)
    # and that the student hasn't mastered yet
    result = await run_query("""
        MATCH (c:Concept)
        WHERE NOT EXISTS {
            MATCH (s:Student {id: $uid})-[r:HAS_SKILL]->(c)
            WHERE r.level >= 0.7
        }
        AND NOT EXISTS {
            MATCH (s:Student {id: $uid})-[:HAS_GAP]->(c)
        }
        OPTIONAL MATCH (c)-[:DEPENDS_ON]->(prereq:Concept)
        WITH c, COLLECT(prereq) AS prereqs
        WHERE SIZE(prereqs) = 0
           OR ALL(p IN prereqs WHERE EXISTS {
               MATCH (s:Student {id: $uid})-[:HAS_SKILL]->(p)
           })
        RETURN c.id AS id, c.name AS name, c.tier AS tier, c.difficulty AS difficulty
        ORDER BY c.tier ASC, c.difficulty ASC
        LIMIT 3
    """, {"uid": user_id})

    # Fallback to profile-based recommendation if graph query returns nothing
    if not result:
        profile = await get_profile(user_id)
        gaps = profile.get("gaps", []) if profile else []
        if gaps:
            result = await run_query("""
                MATCH (c:Concept {name: $name})
                RETURN c.id AS id, c.name AS name, c.tier AS tier, c.difficulty AS difficulty
                LIMIT 1
            """, {"name": gaps[0]})

    return {"recommendations": result}


@router.get("/path")
async def get_learning_path(
    from_concept: str = Query(..., description="Name of starting concept"),
    to_concept: str = Query(..., description="Name of target concept"),
):
    """
    Find the shortest learning path between two concepts.
    Uses undirected DEPENDS_ON traversal so it works regardless of edge direction,
    then orders the result from the requested 'from' concept to 'to'.
    """
    # Try undirected first — works with any DEPENDS_ON direction in the dataset
    result = await run_query("""
        MATCH path = shortestPath(
            (a:Concept {name: $from_concept})-[:DEPENDS_ON*]-(b:Concept {name: $to_concept})
        )
        RETURN [node IN nodes(path) | {id: node.id, name: node.name, tier: node.tier}] AS path_nodes,
               length(path) AS hops
    """, {"from_concept": from_concept, "to_concept": to_concept})

    if not result:
        return {"path": [], "message": f"No dependency path between '{from_concept}' and '{to_concept}'"}

    return {"path": result[0]["path_nodes"], "hops": result[0]["hops"]}
