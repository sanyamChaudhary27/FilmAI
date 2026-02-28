import React, { useState } from 'react';
import { Scissors, Zap, Info, Loader2, AlertCircle } from 'lucide-react';
import { editVideo, type EditPlan } from '../services/api';

interface SmartVideoStripperProps {
  videoId: string | null;
  onPlanGenerated: (plan: EditPlan) => void;
}

const SmartVideoStripper: React.FC<SmartVideoStripperProps> = ({ videoId, onPlanGenerated }) => {
  const [isStripping, setIsStripping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStrip = async () => {
    if (!videoId) {
      setError("Please upload a video first.");
      return;
    }

    setIsStripping(true);
    setError(null);
    try {
      const response = await editVideo(videoId, "Remove silence and dead pauses");
      onPlanGenerated(response.plan);
    } catch (err) {
      console.error("Stripping failed:", err);
      setError("Failed to start stripping. Is the backend running?");
      setIsStripping(false);
    }
  };

  return (
    <div className="stripper-card glass">
      <div className="card-header">
        <div className="header-icon">
          <Scissors size={20} />
        </div>
        <div className="header-text">
          <h3>Smart Video Stripper</h3>
          <p>Remove silence and dead pauses automatically.</p>
        </div>
      </div>

      <div className="stripper-params">
        <div className="param-item">
          <label>Silence Threshold</label>
          <input type="range" min="-60" max="-20" defaultValue="-40" />
          <div className="param-labels">
            <span>Quiet (-60dB)</span>
            <span>Aggressive (-20dB)</span>
          </div>
        </div>
      </div>

      <div className="stripper-info">
        <Info size={14} />
        <span>Uses Pydub & FFmpeg engine for precise cutting.</span>
      </div>

      {error && (
        <div className="stripper-info" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <button
        className={`btn-primary stripper-btn ${isStripping || !videoId ? 'disabled' : ''}`}
        onClick={handleStrip}
        disabled={isStripping || !videoId}
      >
        {isStripping ? (
          <><Loader2 className="animate-spin" size={18} /> Stripping Video...</>
        ) : (
          <><Zap size={18} /> {videoId ? 'Start Smart Stripping' : 'Upload Video to Start'}</>
        )}
      </button>

      <style>{`
        .stripper-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .card-header {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .header-icon {
          width: 44px;
          height: 44px;
          background: var(--primary-glow);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        
        .header-text h3 {
          font-size: 18px;
          margin-bottom: 2px;
        }
        
        .header-text p {
          font-size: 14px;
          color: var(--text-muted);
        }
        
        .stripper-params label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-muted);
        }
        
        input[type="range"] {
          width: 100%;
          accent-color: var(--primary);
          height: 6px;
          background: var(--border);
          border-radius: 10px;
          appearance: none;
        }
        
        .param-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 8px;
        }
        
        .stripper-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.05);
          padding: 12px;
          border-radius: 10px;
          font-size: 12px;
          color: var(--accent);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        
        .stripper-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          height: 48px;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartVideoStripper;
