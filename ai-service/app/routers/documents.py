import uuid

from fastapi import APIRouter
from pydantic import BaseModel
from qdrant_client.models import PointStruct

from app.chunking import chunk_text
from app.config import settings
from app.embeddings import embed
from app.qdrant import client
from app.retrieval import retrieve_chunks

router = APIRouter(prefix="/api")


class IngestRequest(BaseModel):
    document_id: str
    filename: str
    text: str


class IngestResponse(BaseModel):
    chunks_indexed: int


@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest) -> IngestResponse:
    chunks = chunk_text(request.text)
    if not chunks:
        return IngestResponse(chunks_indexed=0)

    vectors = embed(chunks)
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "document_id": request.document_id,
                "filename": request.filename,
                "chunk_index": index,
                "text": chunk,
            },
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]

    client.upsert(collection_name=settings.qdrant_collection, points=points)
    return IngestResponse(chunks_indexed=len(points))


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    text: str
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]


@router.post("/search", response_model=SearchResponse)
def search(request: SearchRequest) -> SearchResponse:
    hits = retrieve_chunks(request.query, request.top_k)

    return SearchResponse(
        results=[
            SearchResult(
                document_id=hit.payload["document_id"],
                filename=hit.payload["filename"],
                chunk_index=hit.payload["chunk_index"],
                text=hit.payload["text"],
                score=hit.score,
            )
            for hit in hits
        ]
    )
