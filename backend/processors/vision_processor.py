import os
from scenedetect import detect, ContentDetector, split_video_ffmpeg
from core.config import settings

class VisionProcessor:
    def __init__(self):
        self.processed_dir = settings.PROCESSED_DIR

    def detect_scenes(self, video_path: str):
        """
        Detects changes in scenes in the video.
        """
        print(f"Detecting scenes in {video_path}...")
        scene_list = detect(video_path, ContentDetector())
        
        scenes = []
        for i, scene in enumerate(scene_list):
            scenes.append({
                "scene_id": i,
                "start": scene[0].get_seconds(),
                "end": scene[1].get_seconds(),
            })
            
        return scenes

    def split_scenes(self, video_path: str, output_dir: str):
        """
        Splits the video into separate files based on detected scenes.
        """
        scene_list = detect(video_path, ContentDetector())
        split_video_ffmpeg(video_path, scene_list, output_dir=output_dir)
        return len(scene_list)

vision_processor = VisionProcessor()
