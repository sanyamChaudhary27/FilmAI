import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "FilmAI"
    API_V1_STR: str = "/api/v1"
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Storage Paths
    UPLOAD_DIR: str = os.path.join("backend", "data", "uploads")
    PROCESSED_DIR: str = os.path.join("backend", "data", "processed")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
