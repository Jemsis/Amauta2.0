from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    """Configuración de la aplicación - lee variables de entorno del sistema"""
    
    # API Keys
    groq_api_key: str = Field(default="", description="API Key de Groq")
    groq_model: str = Field(default="llama-3.3-70b-versatile")
    
    # Google (opcional)
    google_api_key: Optional[str] = Field(default=None)
    google_project_id: Optional[str] = Field(default=None)
    google_location: str = Field(default="us-central1")
    gemini_model: str = Field(default="gemini-1.5-flash")
    
    # App
    app_env: str = Field(default="development")
    allowed_origins: List[str] = Field(default=["*"])
    
    class Config:
        # ✅ IMPORTANTE: No buscar archivo .env, solo usar variables del sistema
        env_file = None
        extra = "ignore"

# Crear instancia global de settings
settings = Settings()
