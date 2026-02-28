import React, { useState, useCallback, useEffect, useRef } from 'react';
import { uploadVideo, getStatus, editVideo, type TaskStatus } from './services/api';

// Icons as simple SVG components for robustness
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const App: React.FC = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const API_BASE = 'http://localhost:8001';

  // Status Polling
  useEffect(() => {
    let interval: any;
    if (videoId && (status?.status !== 'completed' && status?.status !== 'failed')) {
      interval = setInterval(async () => {
        try {
          const newStatus = await getStatus(videoId);
          setStatus(newStatus);
          
          if (newStatus.status === 'completed' && newStatus.output_url) {
            setVideoUrl(`${API_BASE}${newStatus.output_url}`);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [videoId, status?.status]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setVideoUrl(URL.createObjectURL(file)); // Preview local first
    try {
      const resp = await uploadVideo(file);
      setVideoId(resp.video_id);
      const initialStatus = await getStatus(resp.video_id);
      setStatus(initialStatus);
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAIPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId || !prompt.trim()) return;

    try {
      await editVideo(videoId, prompt);
      const newStatus = await getStatus(videoId);
      setStatus(newStatus);
    } catch (e) {
      console.error('AI Request failed:', e);
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'completed': return '#4ade80';
      case 'processing': return '#f52d2d';
      case 'thinking': return '#1a73e8';
      case 'failed': return '#ef4444';
      default: return '#a0a0a0';
    }
  };

  const isProcessing = status?.status === 'thinking' || status?.status === 'processing';

  return (
    <div className="container">
      {/* Sidebar - Left */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">AMD</span>
          <span className="brand-title">FilmAI</span>
        </div>
        
        <div className="sidebar-section">
          <h3>Assets</h3>
          <label className={`upload-area ${isUploading ? 'uploading' : ''}`}>
             <input type="file" accept="video/*" onChange={handleFileUpload} hidden />
             <div className="upload-content">
               <UploadIcon />
               <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
             </div>
          </label>
        </div>

        <div className="sidebar-section">
          <h3>Recent</h3>
          <div className="empty-state">No recent edits</div>
        </div>

        <div className="footer-credits">
           Hackathon Prototype v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Top Navbar */}
        <nav className="nav glass">
          <div className="status-indicator">
            <span className="dot" style={{ backgroundColor: getStatusColor() }}></span>
            <span className="status-text">
              {status ? `${status.status.charAt(0).toUpperCase()}${status.status.slice(1)}` : 'Idle'}
              {status?.progress !== undefined && status.progress > 0 && ` (${status.progress}%)`}
            </span>
          </div>
          <button className="glow-btn" disabled={!videoUrl || status?.status !== 'completed'}>
            Export Result
          </button>
        </nav>

        {/* Video Editor Hub */}
        <section className="editor-hub">
          <div className="preview-container glass">
            {videoUrl ? (
              <>
                <video ref={videoRef} src={videoUrl} controls className="main-video" />
                {isProcessing && (
                  <div className="processing-overlay">
                    <div className="spinner"></div>
                    <div className="progress-bar-container">
                       <div className="progress-bar-fill" style={{ width: `${status?.progress || 0}%` }}></div>
                    </div>
                    <span>AI is editing your masterpiece...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="preview-placeholder">
                <UploadIcon />
                <p>Upload a video to start editing with AI</p>
              </div>
            )}
          </div>

          <div className="timeline-container glass">
            <div className="timeline-header">
              <span>Timeline</span>
              <div className="timeline-controls">
                <PlayIcon />
              </div>
            </div>
            <div className="timeline-track">
               {videoUrl && <div className="video-segment"></div>}
            </div>
          </div>
        </section>

        {/* AI Command Bar */}
        <footer className="footer-bar glass">
          <form onSubmit={handleAIPromptSubmit} className="prompt-form">
            <div className="prompt-wrapper">
              <span className="ai-status">AI</span>
              <input 
                type="text" 
                placeholder="Describe your edit (e.g. 'Make it energetic, remove silence and add captions')" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!videoId || isProcessing}
                className="prompt-input"
              />
              <button 
                type="submit" 
                className={`send-btn ${isProcessing ? 'loading' : ''}`}
                disabled={!videoId || isProcessing || !prompt.trim()}
              >
                {isProcessing ? 'Editing...' : 'Apply AI Edit'}
              </button>
            </div>
            <div className="quick-actions">
              <button type="button" onClick={() => setPrompt("Remove all awkward silences")} disabled={!videoId || isProcessing}>🔇 Silence</button>
              <button type="button" onClick={() => setPrompt("Add professional captions")} disabled={!videoId || isProcessing}>💬 Captions</button>
              <button type="button" onClick={() => setPrompt("Make it an energetic reel")} disabled={!videoId || isProcessing}>🔥 Energetic</button>
              <button type="button" onClick={() => setPrompt("Cinematic style with background removal")} disabled={!videoId || isProcessing}>🎬 Cinematic</button>
            </div>
          </form>
        </footer>
      </main>

      <style>{`
        .container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: #000;
        }

        .sidebar {
          width: 260px;
          background: var(--bg-darker);
          border-right: 1px solid var(--border-light);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: -1px;
        }

        .brand-logo { color: var(--primary); }

        .sidebar h3 {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-dark);
          margin-bottom: 12px;
          letter-spacing: 1px;
        }

        .upload-area {
          display: block;
          border: 2px dashed var(--border-light);
          border-radius: var(--radius-lg);
          padding: 20px;
          text-align: center;
          transition: var(--transition);
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: var(--primary);
          background: rgba(245, 45, 45, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-dim);
          font-size: 14px;
          font-weight: 500;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .nav {
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 5;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          font-size: 14px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .editor-hub {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .preview-container {
          flex: 4;
          min-height: 400px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: var(--bg-dark);
          overflow: hidden;
        }

        .main-video {
          width: 100%;
          height: 100%;
          max-height: 70vh;
          object-fit: contain;
        }

        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-dark);
        }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          z-index: 20;
          backdrop-filter: blur(5px);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(245, 45, 45, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .progress-bar-container {
          width: 300px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.4s ease;
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .timeline-container {
          flex: 1;
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg-darker);
          min-height: 120px;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-dark);
          text-transform: uppercase;
        }

        .timeline-track {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
        }

        .video-segment {
          position: absolute;
          height: 100%;
          width: 200px;
          background: linear-gradient(90deg, #333, #444);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .footer-bar {
          padding: 24px;
          z-index: 5;
        }

        .prompt-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-black);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-full);
          padding: 6px 6px 6px 16px;
          gap: 12px;
          transition: var(--transition);
        }

        .prompt-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(245, 45, 45, 0.1);
        }

        .ai-status {
          background: var(--primary);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .prompt-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 15px;
        }

        .send-btn {
          background: var(--bg-dark);
          color: white;
          border-radius: var(--radius-full);
          padding: 8px 20px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid var(--border-light);
        }

        .send-btn:not(:disabled):hover {
          background: var(--primary);
          border-color: var(--primary);
        }

        .quick-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          justify-content: center;
        }

        .quick-actions button {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-dim);
          font-size: 12px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        .quick-actions button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: var(--border-active);
        }

        .footer-credits {
          margin-top: auto;
          font-size: 10px;
          color: var(--text-dark);
          text-align: center;
        }

        .empty-state {
          color: var(--text-dark);
          font-style: italic;
          font-size: 13px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default App;
