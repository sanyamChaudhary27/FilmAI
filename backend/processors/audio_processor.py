import os
from pydub import AudioSegment
from pydub.silence import split_on_silence
from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips
from core.config import settings

class AudioProcessor:
    def __init__(self):
        self.processed_dir = settings.PROCESSED_DIR

    def _safe_subclip(self, clip, start, end):
        if hasattr(clip, "subclipped"):
            return clip.subclipped(start, end)
        return clip.subclip(start, end)

    def remove_silence(self, video: VideoFileClip, output_path: str, min_silence_len=1000, silence_thresh=-40, keep_silence=200):
        """
        Removes silence from a video clip using pydub.
        """
        print(f"Removing silence from video clip...")
        
        if not video.audio:
            print("No audio track found, returning original video.")
            video.write_videofile(output_path, codec="libx264")
            return output_path
            
        # Extract audio from video to a valid temp file
        import uuid
        temp_audio = os.path.join(self.processed_dir, f"temp_audio_{uuid.uuid4().hex}.wav")
        video.audio.write_audiofile(temp_audio, verbose=False, logger=None)
        
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
            print("No silence detected or silence threshold too high. writing original to output.")
            video.write_videofile(output_path, codec="libx264", audio_codec="aac")
            if os.path.exists(temp_audio):
                os.remove(temp_audio)
            return output_path

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
            clips.append(self._safe_subclip(video, start_s, end_s))
            
        if not clips:
            print("No clips to assemble, writing original.")
            video.write_videofile(output_path, codec="libx264", audio_codec="aac")
            if os.path.exists(temp_audio):
                os.remove(temp_audio)
            if os.path.exists(temp_processed_audio):
                os.remove(temp_processed_audio)
            return output_path

        final_video = concatenate_videoclips(clips, method="compose")
        final_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        # Cleanup
        video.close()
        for c in clips:
            c.close()
        final_video.close()
        os.remove(temp_audio)
        os.remove(temp_processed_audio)
        
        return output_path

audio_processor = AudioProcessor()
