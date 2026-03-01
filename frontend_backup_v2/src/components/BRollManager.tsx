import React from 'react';
import { Music, Plus, Film, Trash2, Layout } from 'lucide-react';

const AssetCard: React.FC<{ name: string; type: 'video' | 'audio' }> = ({ name, type }) => (
    <div className="asset-item selectable">
        <div className="asset-thumb">
            {type === 'video' ? <Film size={18} /> : <Music size={18} />}
        </div>
        <div className="asset-info">
            <span className="asset-name">{name}</span>
            <span className="asset-meta">{type === 'video' ? 'Stock Clip' : 'Background Music'}</span>
        </div>
        <div className="asset-actions">
            <Trash2 size={14} className="hover-red" />
        </div>
    </div>
);

const BRollManager: React.FC = () => {
    return (
        <div className="broll-card glass">
            <div className="card-header">
                <div className="header-icon purple">
                    <Music size={20} />
                </div>
                <div className="header-text">
                    <h3>B-Roll Manager</h3>
                    <p>Curate additional footage and soundscapes.</p>
                </div>
                <button className="add-btn">
                    <Plus size={16} />
                </button>
            </div>

            <div className="asset-list">
                <AssetCard name="Cinematic_Skyline.mp4" type="video" />
                <AssetCard name="Lofi_Beat_01.mp3" type="audio" />
                <AssetCard name="Urban_Walking.mp4" type="video" />
            </div>

            <div className="broll-footer">
                <div className="auto-suggest">
                    <Layout size={14} />
                    <span>AI Suggestion: "Try a high-angle drone shot."</span>
                </div>
            </div>

            <style>{`
        .broll-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .header-icon.purple {
          background: rgba(139, 92, 246, 0.1);
          color: var(--secondary);
        }
        
        .add-btn {
          margin-left: auto;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .add-btn:hover {
          background: var(--border);
        }
        
        .asset-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .asset-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        
        .asset-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--border);
        }
        
        .asset-thumb {
          width: 36px;
          height: 36px;
          background: var(--bg-dark);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        
        .asset-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .asset-name {
          font-size: 14px;
          font-weight: 500;
        }
        
        .asset-meta {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .hover-red:hover {
          color: #ef4444;
          cursor: pointer;
        }
        
        .broll-footer {
          margin-top: 4px;
        }
        
        .auto-suggest {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(139, 92, 246, 0.05);
          padding: 10px;
          border-radius: 10px;
          font-size: 11px;
          color: var(--secondary);
          border: 1px solid rgba(139, 92, 246, 0.1);
          font-weight: 500;
        }
      `}</style>
        </div>
    );
};

export default BRollManager;
