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

    def _safe_subclip(self, clip, start, end):
        if hasattr(clip, "subclipped"):
            return clip.subclipped(start, end)
        return clip.subclip(start, end)

    async def execute_plan(self, plan: EditingPlan) -> str:
        try:
            # Find input path with extension
            input_path = None
            for ext in ["mp4", "mov", "avi", "mkv"]:
                p = os.path.join(self.upload_dir, f"{plan.video_id}.{ext}")
                if os.path.exists(p):
                    input_path = p
                    break

            if not input_path:
                task_store[plan.video_id].status = "failed"
                task_store[plan.video_id].error = f"Video file for {plan.video_id} not found"
                raise FileNotFoundError(f"Video file for {plan.video_id} not found")

            output_filename = f"processed_{plan.video_id}.mp4"
            output_path = os.path.join(self.processed_dir, output_filename)

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
            return self._safe_subclip(clip, start, end)
            
        elif action.action == "grayscale":
            return clip.fx(lambda c: c.blackwhite())
            
        elif action.action == "remove_silence":
            print("Silence removal requested...")
            temp_path = os.path.join(self.processed_dir, f"silence_{video_id}.mp4")
            audio_processor.remove_silence(clip, temp_path)
            return VideoFileClip(temp_path)
            
        elif action.action == "auto_captions":
            print("Auto-captions requested...")
            temp_path = os.path.join(self.processed_dir, f"captions_{video_id}.mp4")
            caption_processor.generate_captions(clip, temp_path)
            return VideoFileClip(temp_path)

        elif action.action == "remove_bg":
            print("Background removal requested...")
            from processors.background_remover import background_remover
            temp_path = os.path.join(self.processed_dir, f"bg_rem_{video_id}.mp4")
            background_remover.remove_background(clip.filename, temp_path)
            return VideoFileClip(temp_path)

        elif action.action == "broll":
            print("B-roll insertion requested...")
            broll_dir = os.path.join("backend", "data", "broll")
            os.makedirs(broll_dir, exist_ok=True)
            
            if "filename" in action.parameters:
                broll_path = os.path.join(broll_dir, action.parameters["filename"])
            else:
                files = [f for f in os.listdir(broll_dir) if f.endswith(('.mp4', '.mov'))]
                if not files:
                    print("No B-roll clips found, using placeholder color clip.")
                    broll_clip = ColorClip(size=clip.size, color=(100, 100, 255), duration=2).set_start(2)
                    return CompositeVideoClip([clip, broll_clip.set_position("center")])
                broll_path = os.path.join(broll_dir, files[0])
            
            if os.path.exists(broll_path):
                broll_clip = self._safe_subclip(VideoFileClip(broll_path), 0, 2).set_start(2)
                if broll_clip.w > clip.w or broll_clip.h > clip.h:
                    broll_clip = broll_clip.resize(width=clip.w * 0.8)
                return CompositeVideoClip([clip, broll_clip.set_position("center")])
            return clip

        return clip

video_processor = VideoProcessor()
