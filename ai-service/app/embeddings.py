from functools import lru_cache

from fastembed import TextEmbedding

# Matches the 384-dim cosine collection provisioned in app.qdrant. fastembed
# (ONNX runtime) is used instead of sentence-transformers/torch because the
# latter needs far more RAM than free-tier hosting (e.g. Render) provides -
# it OOM-crashed the service on first embedding call in production.
_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _model() -> TextEmbedding:
    return TextEmbedding(model_name=_MODEL_NAME)


def embed(texts: list[str]) -> list[list[float]]:
    return [vector.tolist() for vector in _model().embed(texts)]
