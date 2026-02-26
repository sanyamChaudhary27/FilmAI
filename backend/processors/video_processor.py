import os
from moviepy.editor import VideoFileClip, ColorClip, CompositeVideoClip
from core.config import settings
from core.status import task_store
from agents.models import EditingPlan, EditAction

class VideoProcessor:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.processed_dir = settings.PROCESSED_DIR

    async def execute_plan(self, plan: EditingPlan) -> str:
        input_path = os.path.join(self.upload_dir, f"{plan.video_id}.mp4")
        output_filename = f"processed_{plan.video_id}.mp4"
        output_path = os.path.join(self.processed_dir, output_filename)

        if not os.path.exists(input_path):
            task_store[plan.video_id].status = "failed"
            task_store[plan.video_id].error = f"Video file {input_path} not found"
            raise FileNotFoundError(f"Video file {input_path} not found")

        task_store[plan.video_id].status = "processing"
        task_store[plan.video_id].progress = 10
        
        clip = VideoFileClip(input_path)
        
        # Process actions
        total_actions = len(plan.actions)
        for i, action in enumerate(plan.actions):
            clip = self._apply_action(clip, action)
            task_store[plan.video_id].progress = 10 + int((i + 1) / total_actions * 70)

        # Write result
        task_store[plan.video_id].progress = 85
        clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
        clip.close()
        
        task_store[plan.video_id].status = "completed"
        task_store[plan.video_id].progress = 100
        task_store[plan.video_id].output_url = f"/download/{output_filename}"
        
        return output_path

    def _apply_action(self, clip, action: EditAction):
        if action.action == "trim":
            start = action.start_time or 0
            end = action.end_time or clip.duration
            return clip.subclip(start, end)
            
        elif action.action == "grayscale":
            return clip.fx(lambda c: c.blackwhite())
            
        elif action.action == "remove_bg":
            # This will be handled by the specialized BackgroundRemover
            # For now, we just pass through or return a placeholder
            print("Background removal requested, calling BackgroundRemover...")
            return clip

        return clip

video_processor = VideoProcessor()
