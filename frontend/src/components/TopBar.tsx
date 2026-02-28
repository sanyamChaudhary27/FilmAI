import React from 'react';
import { Layers, Undo2, Redo2, Save, Settings, Play, Loader2 } from 'lucide-react';
import { type TaskStatus } from '../services/api';

interface TopBarProps {
    videoId: string | null;
    status: TaskStatus | null;
    onProcess: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ videoId, status, onProcess }) => {
    return (
        <header className="top-bar glass">
            <div className="brand">
                <div className="logo-box">
                    <Layers size={20} />
                </div>
                <h1>AI Studio <span>PRO</span></h1>
            </div>

            <div className="history-controls">
                <button title="Undo"><Undo2 size={18} /></button>
                <button title="Redo"><Redo2 size={18} /></button>
            </div>

            <div className="top-actions">
                <button
                    className={`process-btn ${!videoId || status?.status === 'processing' ? 'disabled' : ''}`}
                    onClick={onProcess}
                    disabled={!videoId || status?.status === 'processing'}
                >
                    {status?.status === 'processing' ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : (
                        <><Play size={16} fill="currentColor" /> Process Video</>
                    )}
                </button>
                <button className="icon-btn"><Save size={18} /></button>
                <button className="icon-btn"><Settings size={18} /></button>
            </div>

            <style>{`
                .top-bar {
                    height: var(--topbar-height);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    border-bottom: 1px solid var(--border);
                    z-index: 100;
                    background: rgba(13, 13, 15, 0.9);
                    backdrop-filter: blur(20px);
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-box {
                    width: 32px;
                    height: 32px;
                    background: var(--primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                }

                .brand h1 {
                    font-size: 18px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .brand span {
                    font-size: 10px;
                    background: rgba(0, 194, 255, 0.1);
                    color: var(--primary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 8px;
                    font-weight: 800;
                }

                .history-controls {
                    display: flex;
                    gap: 16px;
                    position: absolute;
                    left: 50%;
                    transform: translateX(-350%);
                }

                .history-controls button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .history-controls button:hover {
                    color: var(--text-main);
                }

                .top-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .process-btn {
                    background: var(--primary);
                    color: black;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-family: var(--font-heading);
                    transition: all 0.2s;
                }

                .process-btn:hover:not(.disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px var(--primary-glow);
                }

                .process-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .icon-btn:hover {
                    background: var(--border);
                    color: var(--text-main);
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </header>
    );
};

export default TopBar;
