import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sun, User, Sparkles } from 'lucide-react';
import { type TaskStatus } from '../services/api';

interface PreviewCanvasProps {
    videoId: string | null;
    status: TaskStatus | null;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ videoId, status, onTimeUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);

    const videoSrc = status?.status === 'completed'
        ? `http://localhost:8001${status.output_url}`
        : videoId ? `http://localhost:8001/uploads/${videoId}` : null;

    // Reset player state when video source changes
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [videoSrc]);

    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(prev => !prev);
    }, [isPlaying]);

    const handleSkipBack = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, video.currentTime - 5);
    }, []);

    const handleSkipForward = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);
        onTimeUpdate?.(video.currentTime, video.duration);
    }, [onTimeUpdate]);

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setDuration(video.duration);
        video.volume = volume;
    }, [volume]);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoRef.current) videoRef.current.volume = val;
    }, []);

    const handleMuteToggle = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        video.muted = newMuted;
    }, [isMuted]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const t = parseFloat(e.target.value);
        video.currentTime = t;
        setCurrentTime(t);
    }, []);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumePercent = isMuted ? 0 : volume * 100;

    return (
        <section className="preview-canvas">
            <div className="canvas-stage glass">
                {videoSrc ? (
                    <div className="video-wrapper">
                        <video
                            ref={videoRef}
                            key={videoSrc}
                            src={videoSrc}
                            className="main-video-player"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={handleEnded}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {status?.status === 'processing' && (
                            <div className="processing-overlay-premium">
                                <div className="processing-card-premium glass">
                                    <Sparkles size={32} className="text-primary animate-pulse" />
                                    <h4>AI Engine Processing</h4>
                                    <div className="premium-progress-bar">
                                        <div className="premium-progress-fill" style={{ width: `${status.progress}%` }}></div>
                                    </div>
                                    <span className="progress-percent">{status.progress}% Complete</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="play-button-overlay">
                        <div className="play-icon-ring">
                            <Play size={32} fill="currentColor" />
                        </div>
                    </div>
                )}

                {!videoId && (
                    <div className="watermark">
                        <h3>Preview Canvas</h3>
                        <p>Upload a video to begin editing</p>
                    </div>
                )}

                <div className="canvas-tools">
                    <button title="Brightness"><Sun size={18} /></button>
                    <button title="Face Track"><User size={18} /></button>
                </div>
            </div>

            {/* Seek bar */}
            {videoSrc && (
                <div className="seek-bar-container">
                    <input
                        type="range"
                        className="seek-bar"
                        min={0}
                        max={duration || 0}
                        step={0.01}
                        value={currentTime}
                        onChange={handleSeek}
                    />
                    <div className="seek-fill" style={{ width: `${progressPercent}%` }} />
                </div>
            )}

            <div className="playback-bar glass">
                <div className="time-display">{formatTime(currentTime)}</div>

                <div className="playback-controls">
                    <button className="control-btn" onClick={handleSkipBack} title="Back 5s">
                        <SkipBack size={20} fill="currentColor" />
                    </button>
                    <button
                        className="play-btn-main"
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying
                            ? <Pause size={22} fill="currentColor" />
                            : <Play size={22} fill="currentColor" />
                        }
                    </button>
                    <button className="control-btn" onClick={handleSkipForward} title="Forward 5s">
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                </div>

                <div className="time-display">{formatTime(duration)}</div>

                <div className="volume-control">
                    <button className="mute-btn" onClick={handleMuteToggle}>
                        {isMuted || volume === 0
                            ? <VolumeX size={18} className="text-muted" />
                            : <Volume2 size={18} className="text-muted" />
                        }
                    </button>
                    <div className="volume-slider-wrap">
                        <input
                            type="range"
                            className="volume-range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                        />
                        <div className="volume-fill" style={{ width: `${volumePercent}%` }} />
                    </div>
                </div>
            </div>

            <style>{`
                .preview-canvas {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 24px;
                    min-width: 0;
                    overflow: hidden;
                }

                .canvas-stage {
                    flex: 1;
                    background: #0d0d0f;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    min-height: 0;
                }

                .video-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .main-video-player {
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 12px;
                    outline: none;
                }

                .processing-overlay-premium {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20;
                }

                .processing-card-premium {
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    min-width: 320px;
                    text-align: center;
                }

                .premium-progress-bar {
                    width: 100%;
                    height: 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }

                .premium-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    box-shadow: 0 0 15px var(--primary-glow);
                    transition: width 0.3s ease-out;
                }

                .progress-percent {
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 1px;
                }

                .play-icon-ring {
                    width: 72px;
                    height: 72px;
                    background: rgba(0,194,255,0.1);
                    border: 1px solid var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
                }

                .play-icon-ring:hover {
                    transform: scale(1.1);
                    background: rgba(0,194,255,0.2);
                    box-shadow: 0 0 30px var(--primary-glow);
                }

                .watermark {
                    position: absolute;
                    bottom: 80px;
                    text-align: center;
                    pointer-events: none;
                }

                .watermark h3 { opacity: 0.3; font-size: 20px; color: var(--text-main); margin-bottom: 4px; }
                .watermark p  { opacity: 0.2; font-size: 14px; color: var(--text-muted); }

                .canvas-tools {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .canvas-tools button {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .canvas-tools button:hover {
                    background: var(--border);
                    color: var(--text-main);
                }

                /* Seek bar */
                .seek-bar-container {
                    position: relative;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    padding: 0 4px;
                }

                .seek-bar {
                    width: 100%;
                    appearance: none;
                    height: 4px;
                    background: var(--border);
                    border-radius: 10px;
                    outline: none;
                    accent-color: var(--primary);
                    cursor: pointer;
                    position: relative;
                    z-index: 2;
                }

                .seek-bar::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--primary);
                    box-shadow: 0 0 8px var(--primary-glow);
                    cursor: pointer;
                }

                .seek-fill {
                    position: absolute;
                    left: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 4px;
                    background: var(--primary);
                    border-radius: 10px;
                    pointer-events: none;
                    z-index: 1;
                }

                /* Playback bar */
                .playback-bar {
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    background: rgba(17,17,20,0.6);
                    flex-shrink: 0;
                    gap: 16px;
                }

                .time-display {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-muted);
                    min-width: 52px;
                }

                .playback-controls {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .control-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.15s;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                }

                .control-btn:hover { color: var(--text-main); }

                .play-btn-main {
                    width: 48px;
                    height: 48px;
                    background: var(--primary);
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                    cursor: pointer;
                    box-shadow: 0 0 20px var(--primary-glow);
                    transition: transform 0.15s, box-shadow 0.15s;
                    flex-shrink: 0;
                }

                .play-btn-main:hover {
                    transform: scale(1.08);
                    box-shadow: 0 0 30px var(--primary-glow);
                }

                .volume-control {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 140px;
                }

                .mute-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s;
                }

                .mute-btn:hover .text-muted { color: var(--text-main); }

                .volume-slider-wrap {
                    flex: 1;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .volume-range {
                    width: 100%;
                    appearance: none;
                    height: 4px;
                    background: var(--border);
                    border-radius: 10px;
                    accent-color: var(--primary);
                    cursor: pointer;
                    position: relative;
                    z-index: 2;
                    outline: none;
                }

                .volume-range::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--primary);
                    cursor: pointer;
                }

                .volume-fill {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 4px;
                    background: var(--primary);
                    border-radius: 10px;
                    pointer-events: none;
                    z-index: 1;
                }

                .text-primary { color: var(--primary); }
                .text-muted { color: var(--text-muted); }

                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
        </section>
    );
};

export default PreviewCanvas;
