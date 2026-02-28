import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { editVideo, type EditPlan } from '../services/api';

interface AICommandCenterProps {
    videoId: string | null;
    onPlanGenerated: (plan: EditPlan) => void;
}

const AICommandCenter: React.FC<AICommandCenterProps> = ({ videoId, onPlanGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSend = async () => {
        if (!videoId || !prompt.trim()) return;

        setIsProcessing(true);
        try {
            const response = await editVideo(videoId, prompt);
            onPlanGenerated(response.plan);
            setPrompt('');
        } catch (err) {
            console.error("AI Command failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="command-center glass">
            <div className="card-header">
                <div className="header-icon cyan">
                    <Sparkles size={20} />
                </div>
                <div className="header-text">
                    <h3>AI Command Center</h3>
                    <p>Tell the agent exactly how to edit your video.</p>
                </div>
            </div>

            <div className="input-group">
                <textarea
                    placeholder="e.g., 'Make it energetic, remove silence, and add some b-roll footage of cities.'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={!videoId || isProcessing}
                />
                <button
                    className={`send-btn ${!prompt.trim() || !videoId || isProcessing ? 'disabled' : ''}`}
                    onClick={handleSend}
                    disabled={!prompt.trim() || !videoId || isProcessing}
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>

            <style>{`
        .command-center {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header-icon.cyan {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
        }

        .input-group {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        textarea {
          width: 100%;
          min-height: 100px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          color: var(--text-main);
          font-family: inherit;
          font-size: 14px;
          resize: none;
          transition: all 0.2s;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .send-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .send-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .send-btn.disabled {
          background: var(--border);
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default AICommandCenter;
