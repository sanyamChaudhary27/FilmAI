import React, { useState } from 'react';
import { Scissors, Music, Type, Zap, Info } from 'lucide-react';

interface RightSidebarProps {
    onApply: () => void;
}

type ActiveTab = 'stripper' | 'audio' | 'text';

const RightSidebar: React.FC<RightSidebarProps> = ({ onApply }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('stripper');
    const [threshold, setThreshold] = useState(65);
    const [robustness, setRobustness] = useState(42);
    const [edgeMode, setEdgeMode] = useState<'smooth' | 'feather' | 'hard'>('smooth');

    return (
        <aside className="right-sidebar glass">
            <div className="tool-tabs">
                <button
                    className={activeTab === 'stripper' ? 'active' : ''}
                    onClick={() => setActiveTab('stripper')}
                >
                    <Scissors size={16} /> AI Stripper
                </button>
                <button
                    className={activeTab === 'audio' ? 'active' : ''}
                    onClick={() => setActiveTab('audio')}
                >
                    <Music size={16} /> Audio
                </button>
                <button
                    className={activeTab === 'text' ? 'active' : ''}
                    onClick={() => setActiveTab('text')}
                >
                    <Type size={16} /> Text
                </button>
            </div>

            <div className="tool-content scroll-y">
                {activeTab === 'stripper' && (
                    <>
                        <div className="tool-header">
                            <div className="tool-icon-box">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div className="tool-title">
                                <h3>AI Background Stripper</h3>
                                <p>Configure removal parameters</p>
                            </div>
                        </div>

                        <div className="params-stack">
                            <div className="param-item">
                                <div className="param-header">
                                    <label>Detection Threshold</label>
                                    <span className="param-value">{threshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={threshold}
                                    onChange={e => setThreshold(Number(e.target.value))}
                                />
                            </div>

                            <div className="param-item">
                                <div className="param-header">
                                    <label>Algorithm Robustness</label>
                                    <span className="param-value">{robustness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={robustness}
                                    onChange={e => setRobustness(Number(e.target.value))}
                                />
                            </div>

                            <div className="param-item">
                                <div className="param-header">
                                    <label>Edge Refinement</label>
                                    <span className="badge-auto">Auto</span>
                                </div>
                                <div className="toggle-group">
                                    <button
                                        className={edgeMode === 'smooth' ? 'active' : ''}
                                        onClick={() => setEdgeMode('smooth')}
                                    >
                                        Smooth
                                    </button>
                                    <button
                                        className={edgeMode === 'feather' ? 'active' : ''}
                                        onClick={() => setEdgeMode('feather')}
                                    >
                                        Feather
                                    </button>
                                    <button
                                        className={edgeMode === 'hard' ? 'active' : ''}
                                        onClick={() => setEdgeMode('hard')}
                                    >
                                        Hard
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="info-box">
                            <Info size={14} />
                            <p>Powered by MediaPipe &amp; Slingshot Engine for real-time segmentation.</p>
                        </div>
                    </>
                )}

                {activeTab === 'audio' && (
                    <div className="empty-tab">
                        <Music size={32} className="text-muted" />
                        <p>Audio tools coming soon</p>
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="empty-tab">
                        <Type size={32} className="text-muted" />
                        <p>Text overlay tools coming soon</p>
                    </div>
                )}
            </div>

            <button className="apply-btn" onClick={onApply}>
                <Zap size={16} fill="currentColor" /> Apply to Sequence
            </button>

            <style>{`
                .right-sidebar {
                    width: var(--sidebar-right-width);
                    height: calc(100vh - var(--topbar-height));
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    border-left: 1px solid var(--border);
                    background: var(--bg-sidebar);
                    overflow: hidden;
                }

                .tool-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 24px;
                    flex-shrink: 0;
                }

                .tool-tabs button {
                    flex: 1;
                    height: 40px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.2s;
                }

                .tool-tabs button:hover {
                    color: var(--text-main);
                    background: rgba(255,255,255,0.05);
                }

                .tool-tabs button.active {
                    background: rgba(0,194,255,0.1);
                    color: var(--primary);
                    border: 1px solid rgba(0,194,255,0.2);
                }

                .tool-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    min-height: 0;
                }

                .tool-header {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .tool-icon-box {
                    width: 44px;
                    height: 44px;
                    background: var(--primary);
                    color: black;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px var(--primary-glow);
                    flex-shrink: 0;
                }

                .tool-title h3 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
                .tool-title p  { font-size: 12px; color: var(--text-muted); }

                .params-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .param-item { display: flex; flex-direction: column; gap: 10px; }

                .param-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .param-header label { font-size: 13px; font-weight: 500; color: var(--text-main); }

                .param-value {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--primary);
                    font-family: 'JetBrains Mono', monospace;
                    min-width: 36px;
                    text-align: right;
                }

                input[type="range"] {
                    width: 100%;
                    appearance: none;
                    height: 4px;
                    background: var(--border);
                    border-radius: 10px;
                    accent-color: var(--primary);
                    cursor: pointer;
                    outline: none;
                }

                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--primary);
                    box-shadow: 0 0 6px var(--primary-glow);
                    cursor: pointer;
                }

                .badge-auto {
                    font-size: 10px;
                    color: #00C2FF;
                    background: rgba(0,194,255,0.1);
                    padding: 2px 8px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }

                .toggle-group {
                    display: flex;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    padding: 4px;
                    border-radius: 10px;
                    gap: 4px;
                }

                .toggle-group button {
                    flex: 1;
                    height: 32px;
                    border: none;
                    background: none;
                    color: var(--text-muted);
                    font-size: 12px;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-group button.active {
                    background: var(--primary);
                    color: black;
                }

                .toggle-group button:not(.active):hover {
                    background: rgba(255,255,255,0.05);
                    color: var(--text-main);
                }

                .info-box {
                    margin-top: 28px;
                    background: rgba(16,185,129,0.05);
                    border: 1px solid rgba(16,185,129,0.1);
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .info-box p { font-size: 12px; color: var(--accent); line-height: 1.6; }

                .empty-tab {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    opacity: 0.4;
                }

                .empty-tab p { font-size: 13px; color: var(--text-muted); }

                .apply-btn {
                    margin-top: 20px;
                    background: var(--primary);
                    color: black;
                    border: none;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px var(--primary-glow);
                    flex-shrink: 0;
                    font-family: var(--font-heading);
                }

                .apply-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px var(--primary-glow);
                }

                .text-muted { color: var(--text-muted); }
                .scroll-y { overflow-y: auto; scrollbar-width: thin; }
            `}</style>
        </aside>
    );
};

export default RightSidebar;
