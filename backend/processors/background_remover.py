import os
import cv2
import mediapipe as mp
import numpy as np
from moviepy.editor import VideoFileClip, VideoClip
from core.config import settings

class BackgroundRemover:
    def __init__(self):
        self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
        self.segment = self.mp_selfie_segmentation.SelfieSegmentation(model_selection=1)

    def process_frame(self, frame):
        # MediaPipe needs RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.segment.process(rgb_frame)
        
        # Create a mask
        condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.1
        
        # Create a solid color background (e.g., green for green screen effect)
        # and combine it with the frame
        bg_image = np.zeros(frame.shape, dtype=np.uint8)
        bg_image[:] = [0, 255, 0] # Green
        
        output_frame = np.where(condition, frame, bg_image)
        return output_frame

    def remove_background(self, video_path: str, output_path: str):
        clip = VideoFileClip(video_path)
        processed_clip = clip.fl_image(self.process_frame)
        processed_clip.write_videofile(output_path, codec="libx264")
        clip.close()

background_remover = BackgroundRemover()
