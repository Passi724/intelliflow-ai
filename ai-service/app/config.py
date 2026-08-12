from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "intelliflow-documents"

    # Chat generation backend: "ollama" (local, free, default for dev) or
    # "groq" (hosted, free tier - used in deployment since Ollama needs more
    # RAM/CPU than free hosting tiers provide).
    llm_provider: str = "ollama"

    # Local model served by Ollama - free, no API key, runs on this machine.
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"

    # Hosted model served by Groq - free tier, OpenAI-compatible API.
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"


settings = Settings()
