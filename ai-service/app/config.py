from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "intelliflow-documents"

    # Local model served by Ollama - free, no API key, runs on this machine.
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"


settings = Settings()
