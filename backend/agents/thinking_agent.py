import google.generativeai as genai
from core.config import settings
from agents.models import EditingPlan, EditAction
import json

class VideoAgent:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def generate_plan(self, prompt: str, video_metadata: dict) -> EditingPlan:
        if not self.model:
            print("WARNING: GEMINI_API_KEY missing. Returning mock plan.")
            return EditingPlan(
                video_id="mock",
                original_prompt=prompt,
                actions=[
                    EditAction(action="remove_silence", parameters={"video_id": "mock"}),
                    EditAction(action="auto_captions", parameters={"video_id": "mock"})
                ],
                estimated_duration=10.0
            )
        system_prompt = f"""
        You are an expert video editor AI. Your task is to translate user requests into a structured editing plan.
        The user has provided a video with metadata: {json.dumps(video_metadata)}.
        
        Available actions:
        1. trim: cut a segment (requires start_time, end_time)
        2. remove_bg: remove background from the video
        3. auto_captions: generate and add burnt-in subtitles
        4. remove_silence: automatically cut out dead air/silence
        5. grayscale: convert to black and white
        6. broll: overlay stock footage or images (requires keywords in parameters)
        
        Creative Styles:
        - "energetic": Add fast transitions, remove silence, use broll, and use bold captions.
        - "professional": Clean cuts, audio normalization, and subtle captions.
        - "cinematic": Grayscale or high-contrast, slow transitions.
        
        Respond ONLY with a JSON object matching this structure:
        {{
            "video_id": "current_id",
            "original_prompt": "{prompt}",
            "actions": [
                {{"action": "action_name", "start_time": 0.0, "end_time": 10.0, "parameters": {{}}}}
            ],
            "estimated_duration": 10.0
        }}
        """
        
        response = self.model.generate_content(f"{system_prompt}\n\nUser Request: {prompt}")
        
        # Basic parsing logic (can be made more robust)
        try:
            plan_data = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return EditingPlan(**plan_data)
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            # Fallback to a simple plan or error handling
            return EditingPlan(video_id="error", original_prompt=prompt, actions=[])

video_agent = VideoAgent()
