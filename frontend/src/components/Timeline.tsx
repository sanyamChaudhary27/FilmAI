import React, { useRef } from 'react';
import { ChevronRight, Eye, Lock, Volume2 } from 'lucide-react';

interface TimelineProps {
    currentTime?: number;
    duration?: number;
}

const TimelineTrack: React.FC<{ label: string; icon: React.ReactNode; items: { label: string; width: string; left: string }[] }> = ({ label, icon, items }) => (
    <div className="track-row">
        <div className="track-head">
            <ChevronRight size={14} className="text-muted" />
            <div className="track-icon">{icon}</div>
            <span className="track-label">{label}</span>
            <div className="track-status">
                <Eye size={12} className="text-muted" />
                <Lock size={12} className="text-muted" />
            </div>
        </div>
        <div className="track-body">
            {items.map((item, idx) => (
                <div key={idx} className="track-item" style={{ width: item.width, left: item.left }}>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    </div>
);

const Timeline: React.FC<TimelineProps> = ({ currentTime = 0, duration = 0 }) => {
    const rulerRef = useRef<HTMLDivElement>(null);

    // Playhead position as percentage across the scrollable track area
    const headOffset = 140; // px – matches .track-head width
    const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <section className="timeline-container glass">
            <div className="timeline-ruler" ref={rulerRef}>
                <div className="ruler-head-spacer" />
                <div className="ruler-markers-scroll">
                    <div className="ruler-markers">
                        {['0:00', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'].map(m => (
                            <div key={m} className="marker">
                                <span className="marker-label">{m}</span>
                                <div className="marker-tick" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Playhead line — positioned across the scrollable track area */}
                <div
                    className="playhead"
                    style={{ left: `calc(${headOffset}px + ${playheadPercent}%)` }}
                >
                    <div className="playhead-handle" />
                </div>
            </div>

            <div className="tracks-outer scroll-y">
                <TimelineTrack
                    label="Video"
                    icon={<div className="dot blue" />}
                    items={[
                        { label: 'Intro', width: '25%', left: '0%' },
                        { label: 'Main Footage', width: '35%', left: '30%' },
                        { label: 'Outro', width: '20%', left: '70%' },
                    ]}
                />
                <TimelineTrack
                    label="Audio"
                    icon={<Volume2 size={12} />}
                    items={[
                        { label: 'Voiceover', width: '60%', left: '0%' },
                        { label: 'Music', width: '30%', left: '65%' },
                    ]}
                />
                <TimelineTrack
                    label="Subtitles"
                    icon={<div className="dot green" />}
                    items={[
                        { label: 'Intro Text', width: '15%', left: '5%' },
                        { label: 'Scene 1', width: '15%', left: '30%' },
                        { label: 'Scene 2', width: '18%', left: '52%' },
                        { label: 'Credits', width: '12%', left: '75%' },
                    ]}
                />
            </div>

            <style>{`
                .timeline-container {
                    height: 260px;
                    display: flex;
                    flex-direction: column;
                    background: rgba(13,13,15,0.8);
                    border-top: 1px solid var(--border);
                    margin: 0 24px 24px 24px;
                    border-radius: 16px;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .timeline-ruler {
                    height: 44px;
                    border-bottom: 1px solid var(--border);
                    position: relative;
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    flex-shrink: 0;
                    overflow: hidden;
                }

                .ruler-head-spacer {
                    width: 140px;
                    flex-shrink: 0;
                    border-right: 1px solid var(--border);
                }

                .ruler-markers-scroll {
                    flex: 1;
                    overflow: hidden;
                }

                .ruler-markers {
                    display: flex;
                    height: 100%;
                    align-items: flex-end;
                }

                .marker {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    min-width: 80px;
                }

                .marker-label {
                    font-size: 10px;
                    color: var(--text-muted);
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                }

                .marker-tick {
                    width: 1px;
                    height: 10px;
                    background: var(--border);
                }

                .playhead {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--primary);
                    box-shadow: 0 0 10px var(--primary-glow);
                    z-index: 10;
                    transition: left 0.1s linear;
                    pointer-events: none;
                }

                .playhead-handle {
                    width: 10px;
                    height: 10px;
                    background: var(--primary);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg) translate(4px,-4px);
                    position: absolute;
                    top: 0;
                    left: -4px;
                    box-shadow: 0 0 8px var(--primary-glow);
                }

                .tracks-outer {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    min-height: 0;
                }

                .track-row {
                    display: flex;
                    height: 60px;
                    border-bottom: 1px solid var(--border);
                    flex-shrink: 0;
                }

                .track-head {
                    width: 140px;
                    padding: 0 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.01);
                    border-right: 1px solid var(--border);
                    flex-shrink: 0;
                }

                .track-icon {
                    width: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-shrink: 0;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .dot.blue { background: var(--primary); box-shadow: 0 0 6px var(--primary-glow); }
                .dot.green { background: var(--accent); }

                .track-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-main);
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-status { display: flex; gap: 6px; flex-shrink: 0; }

                .track-body {
                    flex: 1;
                    position: relative;
                    background-image: linear-gradient(90deg, var(--border) 1px, transparent 1px);
                    background-size: 80px 100%;
                }

                .track-item {
                    position: absolute;
                    top: 10px;
                    bottom: 10px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-main);
                    cursor: move;
                    transition: all 0.2s;
                    backdrop-filter: blur(4px);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-item:hover {
                    border-color: var(--primary);
                    background: rgba(0,194,255,0.1);
                    z-index: 2;
                }

                .text-muted { color: var(--text-muted); }
                .scroll-y { overflow-y: auto; scrollbar-width: thin; }
            `}</style>
        </section>
    );
};

export default Timeline;
