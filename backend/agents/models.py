from pydantic import BaseModel
from typing import List, Optional

class EditAction(BaseModel):
    action: str  # e.g., "cut", "trim", "caption", "remove_bg"
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    parameters: Optional[dict] = {}

class EditingPlan(BaseModel):
    video_id: str
    original_prompt: str
    actions: List[EditAction]
    estimated_duration: Optional[float] = None
