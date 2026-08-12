from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
def health() -> dict:
    return {
        "status": "UP",
        "service": "ai-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
