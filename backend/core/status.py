from pydantic import BaseModel
from typing import Dict

class TaskStatus(BaseModel):
    video_id: str
    status: str  # "uploaded", "processing", "completed", "failed"
    progress: int = 0
    output_url: str = ""
    error: str = ""

# Simple in-memory storage for hackathon prototype
task_store: Dict[str, TaskStatus] = {}
