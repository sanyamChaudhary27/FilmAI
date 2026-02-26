import os
from pydub import AudioSegment
from pydub.silence import split_on_silence
from moviepy.editor import VideoFileClip, AudioFileClip
from core.config import settings

class AudioProcessor:
    def __init__(self):
        self.processed_dir = settings.PROCESSED_DIR

    def remove_silence(self, video_path: str, output_path: str, min_silence_len=1000, silence_thresh=-40, keep_silence=200):
        """
        Removes silence from a video file using pydub.
        """
        print(f"Removing silence from {video_path}...")
        
        # Extract audio from video
        video = VideoFileClip(video_path)
        temp_audio = os.path.join(self.processed_dir, "temp_audio.wav")
        video.audio.write_audiofile(temp_audio)
        
        # Load audio and split on silence
        audio = AudioSegment.from_wav(temp_audio)
        chunks = split_on_silence(
            audio,
            min_silence_len=min_silence_len,
            silence_thresh=silence_thresh,
            keep_silence=keep_silence
        )
        
        # Combine non-silent chunks
        if not chunks:
            print("No silence detected or silence threshold too high.")
            video.close()
            os.remove(temp_audio)
            return video_path

        combined_audio = sum(chunks)
        temp_processed_audio = os.path.join(self.processed_dir, "temp_processed_audio.wav")
        combined_audio.export(temp_processed_audio, format="wav")
        
        # Create new video with processed audio
        # Note: This approach cuts the audio but the video timing remains original.
        # To truly "remove" the silence from video, we'd need to cut the video clips too.
        # For the hackathon, we'll implement a simpler 'Video+Audio' cut approach.
        
        print("Re-assembling video segments based on non-silent audio chunks...")
        
        # Better approach: Get non-silent intervals and subclip the video
        from pydub.silence import detect_nonsilent
        intervals = detect_nonsilent(audio, min_silence_len=min_silence_len, silence_thresh=silence_thresh)
        
        clips = []
        for start_ms, end_ms in intervals:
            # Add some padding
            start_s = max(0, (start_ms - keep_silence) / 1000.0)
            end_s = min(video.duration, (end_ms + keep_silence) / 1000.0)
            clips.append(video.subclip(start_s, end_s))
            
        final_video = concatenate_videoclips(clips) if clips else video
        final_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        # Cleanup
        video.close()
        if clips: final_video.close()
        os.remove(temp_audio)
        os.remove(temp_processed_audio)
        
        return output_path

from moviepy.editor import concatenate_videoclips
audio_processor = AudioProcessor()
