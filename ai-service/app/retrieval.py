from qdrant_client.models import ScoredPoint

from app.config import settings
from app.embeddings import embed
from app.qdrant import client


def retrieve_chunks(query: str, top_k: int) -> list[ScoredPoint]:
    [query_vector] = embed([query])

    return client.query_points(
        collection_name=settings.qdrant_collection,
        query=query_vector,
        limit=top_k,
    ).points
