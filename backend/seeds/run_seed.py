"""
Seeder script — run once to populate Neo4j and MongoDB with:
  - 30 DSA concept nodes + dependency edges
  - 50 DSA problems (also stored in MongoDB for fast retrieval)

Usage:
  cd backend
  python -m seeds.run_seed
"""

import asyncio
import sys
import os

# Allow running as a module from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db.neo4j import connect_neo4j, close_neo4j, run_query
from db.mongo import connect_mongo, close_mongo, get_db
from seeds.concepts import CONCEPTS, DEPENDS_ON_EDGES
from seeds.problems import PROBLEMS


async def seed_neo4j():
    print("\n──────────────────────────────────────────")
    print("📊 Seeding Neo4j Knowledge Graph...")
    print("──────────────────────────────────────────")

    # Clear existing
    await run_query("MATCH (n) DETACH DELETE n")
    print("  ✓ Cleared existing nodes")

    # Create concept nodes
    for c in CONCEPTS:
        await run_query("""
            CREATE (:Concept {
                id: $id,
                name: $name,
                tier: $tier,
                difficulty: $difficulty,
                description: $description,
                subject: 'DSA'
            })
        """, c)
    print(f"  ✓ Created {len(CONCEPTS)} Concept nodes")

    # Create indexes for fast lookup
    await run_query("CREATE INDEX concept_id IF NOT EXISTS FOR (c:Concept) ON (c.id)")
    await run_query("CREATE INDEX student_id IF NOT EXISTS FOR (s:Student) ON (s.id)")

    # Create DEPENDS_ON edges
    for (from_id, to_id) in DEPENDS_ON_EDGES:
        await run_query("""
            MATCH (a:Concept {id: $from_id}), (b:Concept {id: $to_id})
            CREATE (a)-[:DEPENDS_ON]->(b)
        """, {"from_id": from_id, "to_id": to_id})
    print(f"  ✓ Created {len(DEPENDS_ON_EDGES)} DEPENDS_ON edges")

    # Create Problem nodes + TESTS edges
    for p in PROBLEMS:
        await run_query("""
            CREATE (:Problem {
                id: $id,
                title: $title,
                difficulty: $difficulty,
                description: $description
            })
        """, {"id": p["id"], "title": p["title"], "difficulty": p["difficulty"], "description": p["description"]})

        for concept_id in p["concept_ids"]:
            await run_query("""
                MATCH (prob:Problem {id: $pid}), (c:Concept {id: $cid})
                CREATE (prob)-[:TESTS]->(c)
            """, {"pid": p["id"], "cid": concept_id})

    print(f"  ✓ Created {len(PROBLEMS)} Problem nodes with TESTS edges")
    print("  🎉 Neo4j seeding complete!\n")


async def seed_mongodb():
    print("──────────────────────────────────────────")
    print("🍃 Seeding MongoDB Problems collection...")
    print("──────────────────────────────────────────")
    db = get_db()

    # Clear and re-insert problems
    await db.problems.delete_many({})
    if PROBLEMS:
        await db.problems.insert_many(PROBLEMS)
    print(f"  ✓ Inserted {len(PROBLEMS)} problems into MongoDB")

    # Clear and re-insert concepts (for fast API responses)
    await db.concepts.delete_many({})
    if CONCEPTS:
        await db.concepts.insert_many(CONCEPTS)
    print(f"  ✓ Inserted {len(CONCEPTS)} concepts into MongoDB")
    print("  🎉 MongoDB seeding complete!\n")


async def verify():
    print("──────────────────────────────────────────")
    print("🔍 Verification queries...")

    # Count concepts
    result = await run_query("MATCH (c:Concept) RETURN count(c) AS total")
    print(f"  Neo4j concepts: {result[0]['total']}")

    # Count edges
    result = await run_query("MATCH ()-[r:DEPENDS_ON]->() RETURN count(r) AS total")
    print(f"  Neo4j edges: {result[0]['total']}")

    # Example path query: path from Arrays to Dynamic Programming
    result = await run_query("""
        MATCH path = shortestPath(
            (a:Concept {name: 'Arrays'})-[:DEPENDS_ON*]->(b:Concept {name: 'Dynamic Programming'})
        )
        RETURN [node in nodes(path) | node.name] AS learning_path
    """)
    if result:
        print(f"  Learning path Arrays→DP: {result[0]['learning_path']}")

    print("──────────────────────────────────────────\n")


async def main():
    print("\n🚀 Perspectra Seeder — Starting...\n")
    try:
        await connect_neo4j()
        await connect_mongo()
        await seed_neo4j()
        await seed_mongodb()
        await verify()
        print("✅ All done! Database is ready for Perspectra.\n")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        await close_neo4j()
        await close_mongo()


if __name__ == "__main__":
    asyncio.run(main())
