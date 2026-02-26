import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "FilmAI"
    API_V1_STR: str = "/api/v1"
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # FFmpeg Path
    FFMPEG_PATH: str = os.getenv("FFMPEG_PATH", "C:\\Users\\HP\\OneDrive\\FilmAI\\myenv\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe")
    
    # Storage Paths
    UPLOAD_DIR: str = os.path.join("backend", "data", "uploads")
    PROCESSED_DIR: str = os.path.join("backend", "data", "processed")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)

# Set global paths for libraries
os.environ["IMAGEIO_FFMPEG_EXE"] = settings.FFMPEG_PATH

# Add ffmpeg binary directory to system PATH for subprocesses (like Whisper)
ffmpeg_dir = os.path.dirname(settings.FFMPEG_PATH)
if ffmpeg_dir not in os.environ["PATH"]:
    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]

try:
    from pydub import AudioSegment
    AudioSegment.converter = settings.FFMPEG_PATH
except ImportError:
    pass
