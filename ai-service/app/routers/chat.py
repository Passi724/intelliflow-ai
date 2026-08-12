import httpx
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings
from app.retrieval import retrieve_chunks

router = APIRouter(prefix="/api")

SYSTEM_PROMPT = (
    "You are a knowledge assistant for IntelliFlow AI. Answer the user's question "
    "using only the provided document excerpts. If the excerpts don't contain the "
    "answer, say so plainly instead of guessing. Cite the source filename for each claim."
)


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatSource(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatSource]


def _generate(messages: list[dict]) -> str:
    if settings.llm_provider == "groq":
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={"model": settings.groq_model, "messages": messages},
            timeout=60.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    response = httpx.post(
        f"{settings.ollama_url}/api/chat",
        json={"model": settings.ollama_model, "stream": False, "messages": messages},
        timeout=120.0,
    )
    response.raise_for_status()
    return response.json()["message"]["content"]


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    hits = retrieve_chunks(request.query, request.top_k)

    if not hits:
        return ChatResponse(
            answer="I don't have any indexed documents to answer that yet.",
            sources=[],
        )

    context = "\n\n".join(
        f"[Source: {hit.payload['filename']}]\n{hit.payload['text']}" for hit in hits
    )

    answer = _generate(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {request.query}",
            },
        ]
    )

    return ChatResponse(
        answer=answer,
        sources=[
            ChatSource(
                document_id=hit.payload["document_id"],
                filename=hit.payload["filename"],
                chunk_index=hit.payload["chunk_index"],
                score=hit.score,
            )
            for hit in hits
        ],
    )
