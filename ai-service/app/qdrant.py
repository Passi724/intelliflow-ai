from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import settings

# 384 dims matches sentence-transformers/all-MiniLM-L6-v2, the default small
# embedding model this service will use once ingestion is implemented.
EMBEDDING_SIZE = 384

client = QdrantClient(url=settings.qdrant_url)


def ensure_collection() -> None:
    if client.collection_exists(settings.qdrant_collection):
        return

    client.create_collection(
        collection_name=settings.qdrant_collection,
        vectors_config=VectorParams(size=EMBEDDING_SIZE, distance=Distance.COSINE),
    )
