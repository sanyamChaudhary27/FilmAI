import os
from moviepy import VideoFileClip, ColorClip, CompositeVideoClip
from core.config import settings
from core.status import task_store
from agents.models import EditingPlan, EditAction
from processors.audio_processor import audio_processor
from processors.caption_processor import caption_processor
from processors.vision_processor import vision_processor

class VideoProcessor:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.processed_dir = settings.PROCESSED_DIR

    async def execute_plan(self, plan: EditingPlan) -> str:
        try:
            input_path = os.path.join(self.upload_dir, f"{plan.video_id}.mp4")
            output_filename = f"processed_{plan.video_id}.mp4"
            output_path = os.path.join(self.processed_dir, output_filename)

            if not os.path.exists(input_path):
                task_store[plan.video_id].status = "failed"
                task_store[plan.video_id].error = f"Video file {input_path} not found"
                raise FileNotFoundError(f"Video file {input_path} not found")

            task_store[plan.video_id].status = "processing"
            task_store[plan.video_id].progress = 10
            
            print(f"Opening video clip: {input_path}")
            clip = VideoFileClip(input_path)
            
            # Process actions
            total_actions = len(plan.actions)
            for i, action in enumerate(plan.actions):
                print(f"Applying action: {action.action}")
                clip = self._apply_action(clip, action, plan.video_id)
                task_store[plan.video_id].progress = 10 + int((i + 1) / total_actions * 70)

            # Write result
            task_store[plan.video_id].progress = 85
            print(f"Writing output video: {output_path}")
            clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
            clip.close()
            
            task_store[plan.video_id].status = "completed"
            task_store[plan.video_id].progress = 100
            task_store[plan.video_id].output_url = f"/download/{output_filename}"
            
            return output_path
        except Exception as e:
            import traceback
            error_msg = f"Error during processing: {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            if plan.video_id in task_store:
                task_store[plan.video_id].status = "failed"
                task_store[plan.video_id].error = error_msg
            raise e

    def _apply_action(self, clip, action: EditAction, video_id: str):
        if action.action == "trim":
            start = action.start_time or 0
            end = action.end_time or clip.duration
            return clip.subclip(start, end)
            
        elif action.action == "grayscale":
            return clip.fx(lambda c: c.blackwhite())
            
        elif action.action == "remove_bg":
            # This will be handled by the specialized BackgroundRemover
            print("Background removal requested...")
            return clip
            
        elif action.action == "remove_silence":
            print("Silence removal requested...")
            # Pydub/MoviePy integration for silence removal
            temp_path = os.path.join(self.processed_dir, f"silence_{video_id}.mp4")
            audio_processor.remove_silence(clip.filename, temp_path)
            return VideoFileClip(temp_path)
            
        elif action.action == "auto_captions":
            print("Auto-captions requested...")
            temp_path = os.path.join(self.processed_dir, f"captions_{video_id}.mp4")
            caption_processor.generate_captions(clip.filename, temp_path)
            return VideoFileClip(temp_path)

        return clip

video_processor = VideoProcessor()
