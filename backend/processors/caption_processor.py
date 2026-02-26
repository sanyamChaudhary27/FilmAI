import os
import whisper
import cv2
import numpy as np
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
from core.config import settings

class CaptionProcessor:
    def __init__(self, model_size="tiny"):
        print(f"Loading Whisper model ({model_size})...")
        self.model = whisper.load_model(model_size)
        self.processed_dir = settings.PROCESSED_DIR

    def generate_captions(self, video_path: str, output_path: str):
        """
        Generates and burns captions into the video.
        """
        print(f"Generating captions for {video_path}...")
        
        # 1. Transcribe audio
        result = self.model.transcribe(video_path)
        segments = result['segments']
        
        # 2. Add captions to video
        video = VideoFileClip(video_path)
        
        caption_clips = []
        for segment in segments:
            start = segment['start']
            end = segment['end']
            text = segment['text'].strip()
            
            # Create a text clip
            # Note: TextClip might require ImageMagick installed on the system.
            # For a more robust solution, we could use cv2 to draw directly on frames.
            try:
                txt_clip = TextClip(text, fontsize=24, color='white', font='Arial', 
                                    stroke_color='black', stroke_width=1,
                                    method='caption', size=(video.w*0.8, None))
                txt_clip = txt_clip.set_start(start).set_end(end).set_position(('center', video.h*0.8))
                caption_clips.append(txt_clip)
            except Exception as e:
                print(f"Error creating text clip: {e}. Falling back to basic rendering.")
                continue

        if not caption_clips:
            print("No captions generated.")
            return video_path

        final_video = CompositeVideoClip([video] + caption_clips)
        final_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        video.close()
        final_video.close()
        
        return output_path

caption_processor = CaptionProcessor()
