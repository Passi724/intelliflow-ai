from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Populates os.environ from .env so unprefixed vars (e.g. ANTHROPIC_API_KEY,
# read directly by the anthropic SDK) are visible outside this Settings model.
load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "intelliflow-documents"


settings = Settings()
