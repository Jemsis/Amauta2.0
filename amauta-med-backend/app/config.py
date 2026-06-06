from pathlib import Path
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore",  # Ignorar variables sobrantes en .env
        case_sensitive=False,
    )

    groq_api_key: str = Field(default="", validation_alias="GROQ_API_KEY")
    groq_model: str = Field(
        default="llama-3.3-70b-versatile", validation_alias="GROQ_MODEL"
    )
    google_api_key: Optional[str] = Field(default=None, validation_alias="GOOGLE_API_KEY")
    google_project_id: Optional[str] = Field(
        default=None, validation_alias="GOOGLE_PROJECT_ID"
    )
    google_location: str = Field(default="us-central1", validation_alias="GOOGLE_LOCATION")
    gemini_model: str = Field(
        default="gemini-1.5-flash", validation_alias="GEMINI_MODEL"
    )
    app_env: str = Field(default="development", validation_alias="APP_ENV")
    allowed_origins: List[str] = Field(
        default=["*"], validation_alias="CORS_ORIGINS"
    )


settings = Settings()
