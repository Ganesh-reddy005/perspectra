"""
Neo4j AuraDB connection + helper utilities.
Uses the official neo4j Python async driver.
"""

from neo4j import AsyncGraphDatabase, AsyncDriver
from config import get_settings

_driver: AsyncDriver | None = None


async def connect_neo4j():
    global _driver
    settings = get_settings()
    _driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_username, settings.neo4j_password),
    )
    await _driver.verify_connectivity()
    print("[Neo4j] Connected to AuraDB")


async def close_neo4j():
    global _driver
    if _driver:
        await _driver.close()


def get_driver() -> AsyncDriver:
    if _driver is None:
        raise RuntimeError("Neo4j not connected. Call connect_neo4j() first.")
    return _driver


async def run_query(cypher: str, params: dict = {}) -> list[dict]:
    """Execute a read/write Cypher query and return list of record dicts."""
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(cypher, params)
        return [dict(record) for record in await result.data()]


async def test_connection():
    result = await run_query("RETURN 'Neo4j OK' AS status")
    print(result)
    return result
