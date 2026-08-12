from functools import lru_cache

from anthropic import Anthropic
from fastapi import APIRouter
from pydantic import BaseModel

from app.retrieval import retrieve_chunks

router = APIRouter(prefix="/api")


@lru_cache(maxsize=1)
def _anthropic_client() -> Anthropic:
    # Constructed lazily so a missing ANTHROPIC_API_KEY only breaks /api/chat,
    # not the whole service at startup.
    return Anthropic()


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

    message = _anthropic_client().messages.create(
        model="claude-opus-5",
        max_tokens=1024,
        thinking={"type": "disabled"},
        output_config={"effort": "low"},
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {request.query}",
            }
        ],
    )

    answer = next((block.text for block in message.content if block.type == "text"), "")

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
