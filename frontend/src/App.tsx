import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Sparkles, Play, Pause, Download, Cpu, 
  Layers, Volume2, Type, Scissors, ChevronRight, 
  CheckCircle, AlertCircle, Loader2, Music, Clapperboard,
  History, Terminal, Settings2, Trash2, Maximize2, SkipForward, SkipBack, Zap
} from 'lucide-react';
import { uploadVideo, getStatus, editVideo, type TaskStatus } from './services/api';

const API_BASE = 'http://localhost:8001';

const App: React.FC = () => {
  // --- Core Domain State ---
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('project');
  const [history, setHistory] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // --- Real-time Link with Backend ---
  useEffect(() => {
    let interval: any;
    if (videoId && (status?.status !== 'completed' && status?.status !== 'failed')) {
      interval = setInterval(async () => {
        try {
          const newStatus = await getStatus(videoId);
          setStatus(newStatus);
          
          if (newStatus.status === 'completed' && newStatus.output_url) {
             const finalUrl = `${API_BASE}${newStatus.output_url}`;
             if (videoUrl !== finalUrl) setVideoUrl(finalUrl);
          }
        } catch (e) {
          console.error('API Polling Failure:', e);
        }
      }, 1200); // High-frequency polling for smooth UI
    }
    return () => clearInterval(interval);
  }, [videoId, status?.status, videoUrl]);

  // --- UI Helpers ---
  const addLog = (msg: string) => setHistory(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));

  // --- Actions ---
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    addLog(`Initiating high-speed upload: ${file.name}`);
    setVideoUrl(URL.createObjectURL(file)); // Native preview
    try {
      const resp = await uploadVideo(file);
      setVideoId(resp.video_id);
      addLog(`Asset synchronized with ID: ${resp.video_id}`);
      const initial = await getStatus(resp.video_id);
      setStatus(initial);
    } catch (e) {
      addLog(`ERR: Upload channel failed.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCollaboration = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!videoId || !prompt.trim()) return;

    addLog(`AI Collaborative Task Started: "${prompt}"`);
    try {
      await editVideo(videoId, prompt);
      const startStatus = await getStatus(videoId);
      setStatus(startStatus);
    } catch (e) {
      addLog(`ERR: AI Agent disconnected.`);
    }
  };

  const getStatusDisplay = () => {
    if (isUploading) return { color: '#007aff', icon: <Loader2 className="animate-spin" />, text: 'Synchronizing...' };
    if (!status) return { color: '#6c727e', icon: <Clapperboard />, text: 'Source Idle' };
    
    switch (status.status) {
      case 'thinking': return { color: '#9d50bb', icon: <Zap className="animate-pulse" />, text: 'AI Agent Thinking...' };
      case 'processing': return { color: '#ff2d50', icon: <Cpu className="animate-spin" />, text: `Rendering (${status.progress}%)` };
      case 'completed': return { color: '#4ade80', icon: <CheckCircle />, text: 'Master Ready!' };
      case 'failed': return { color: '#ef4444', icon: <AlertCircle />, text: 'Aborted.' };
      default: return { color: '#007aff', icon: <Loader2 className="animate-spin" />, text: 'Analyzing...' };
    }
  };

  const isBusy = isUploading || status?.status === 'thinking' || status?.status === 'processing';
  const display = getStatusDisplay();

  // --- Main Render ---
  return (
    <div className="vh-screen vw-screen flex-row animate-in">
      <AnimatePresence>
        {!videoId && (
          <motion.div 
            className="hero-overlay flex-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="hero-card glass p-40 flex-column align-center gap-24">
              <div className="badge-amd p-red">AMD SLINGSHOT 2026</div>
              <h1 className="hero-title">FilmAI <span className="text-primary-soft">Studio</span></h1>
              <p className="text-center text-dim max-w-400">
                Experience the first zero-cost, agentic video editor. Upload your high-res footage to start collaborating with the AI Agent.
              </p>
              
              <label className="btn-upload flex-row align-center gap-12 pointer">
                 <Upload size={22} />
                 <span>Drop Footage / Click to Browse</span>
                 <input 
                   type="file" 
                   accept="video/*" 
                   hidden 
                   onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} 
                 />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Sidebar */}
      <motion.aside 
        className="sidebar panel-bg flex-column"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
      >
        <div className="sidebar-brand flex-row align-center gap-10 p-24">
           <div className="brand-dot"><Sparkles size={14}/></div>
           <span className="brand-text">FilmAI <span className="text-secondary">P1</span></span>
        </div>

        <nav className="sidebar-nav flex-row px-12 py-8 gap-8">
           <button className={`nav-chip ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}><Layers size={14}/> Project</button>
           <button className={`nav-chip ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><History size={14}/> History</button>
        </nav>

        <div className="sidebar-content flex-1 p-16 overflow-y">
           {activeTab === 'project' ? (
              <div className="asset-cluster flex-column gap-16">
                 <h4 className="label-sm">Sequence Assets</h4>
                 <div className={`asset-tile glass ${videoUrl ? 'active' : ''}`}>
                    {videoUrl ? (
                      <video src={videoUrl} className="asset-thumb" />
                    ) : (
                      <div className="asset-none flex-center"><Clapperboard size={20} className="text-dim"/></div>
                    )}
                    <span className="asset-name">Source_01.mp4</span>
                 </div>
                 <div className="asset-tile border-dashed flex-center"><Upload size={16} className="text-dim"/></div>
              </div>
           ) : (
              <div className="history-cluster flex-column gap-8">
                {history.map((log, i) => (
                  <div key={i} className="history-item label-md">{log}</div>
                ))}
              </div>
           )}
        </div>

        <div className="sidebar-footer p-24 text-dim label-sm text-center border-t border-dim">
           AMD Hackathon Prototype v2.1
        </div>
      </motion.aside>

      {/* Primary Workspace */}
      <main className="main flex-1 flex-column">
        {/* Top Navbar */}
        <header className="workspace-nav border-b border-dim px-24 flex-row justify-between align-center">
           <div className="status-bubble flex-row align-center gap-12 px-16 py-8 rounded-full" style={{ background: `${display.color}10`, border: `1px solid ${display.color}30` }}>
              <span className="flex-row items-center gap-8 font-semibold label-md capitalize" style={{ color: display.color }}>
                {display.icon} {display.text}
              </span>
           </div>

           <div className="nav-actions flex-row gap-12">
              <button className="btn-subtle"><Settings2 size={18}/></button>
              <button 
                className="btn-accent flex-row align-center gap-8"
                disabled={status?.status !== 'completed'}
                onClick={() => status?.output_url && window.open(`${API_BASE}${status.output_url}`)}
              >
                <Download size={18}/> <span>Export Result</span>
              </button>
           </div>
        </header>

        {/* Studio Stage */}
        <section className="stage flex-1 p-24 glass-stage relative overflow-hidden">
           <div className="canvas-wrapper relative flex-center h-full w-full rounded-xl overflow-hidden shadow-float bg-black">
              {videoUrl ? (
                <div className="video-viewport h-full w-full flex-center relative">
                   <video 
                     ref={videoRef} 
                     src={videoUrl} 
                     className="main-video" 
                     onPlay={() => setIsPlaying(true)}
                     onPause={() => setIsPlaying(false)}
                   />
                   
                   {/* AI Progress Overlay */}
                   <AnimatePresence>
                     {isBusy && (
                        <motion.div 
                          className="busy-shield flex-column align-center justify-center gap-24"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                           <div className="ai-core-cluster relative">
                              <div className="ai-core-ring ring-1"></div>
                              <div className="ai-core-ring ring-2"></div>
                              <div className="ai-core-dot"></div>
                           </div>
                           <div className="flex-column align-center gap-12">
                              <span className="label-sm text-white tracking-widest">{status?.status === 'thinking' ? 'AI BRAINSTORMING' : 'AGENT RENDERING'}</span>
                              <div className="render-bar-track glass overflow-hidden">
                                 <motion.div 
                                   className="render-bar-fill"
                                   initial={{ width: 0 }}
                                   animate={{ width: `${status?.progress || 0}%` }}
                                 ></motion.div>
                              </div>
                              <span className="progress-pct">{status?.progress || 0}%</span>
                           </div>
                        </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Transport HUD */}
                   {!isBusy && (
                     <div className="transport-hud flex-row align-center gap-20 p-20 glass absolute bottom-20 rounded-xl">
                        <button className="btn-subtle"><SkipBack size={18}/></button>
                        <button className="btn-play p-red" onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}>
                           {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                        </button>
                        <button className="btn-subtle"><SkipForward size={18}/></button>
                        <div className="timecode text-white font-mono label-md">00:00:02.14</div>
                        <button className="btn-subtle ml-8"><Maximize2 size={18}/></button>
                     </div>
                   )}
                </div>
              ) : (
                <div className="canvas-empty flex-column align-center gap-12 text-dim">
                  <Play size={40} className="opacity-20"/>
                  <span>Master Monitor Ready</span>
                </div>
              )}
           </div>
        </section>

        {/* Pro Timeline Editor */}
        <section className="timeline panel-bg p-20 flex-column gap-16 border-t border-dim overflow-hidden">
           <div className="timeline-header flex-row justify-between label-sm text-dim">
              <div className="flex-row gap-16">
                 <span className="flex-row align-center gap-6"><Maximize2 size={12}/> V track 1</span>
                 <span className="flex-row align-center gap-6"><Volume2 size={12}/> A track 1</span>
                 <span className="flex-row align-center gap-6 text-primary"><Sparkles size={12}/> AI AGENT OVERLAY</span>
              </div>
              <div className="playback-timer text-dim">05s / 10s</div>
           </div>

           <div className="timeline-tracks flex-column gap-6 p-8 glass rounded-lg relative overflow-hidden">
              <div className="track track-v">{videoId && <div className="clip-box v-clip">Capture_Main.mp4</div>}</div>
              <div className="track track-a">{videoId && <div className="clip-box a-clip">Stereo_Mix</div>}</div>
              <div className="track track-ai">
                 {isBusy && (
                    <motion.div 
                      className="clip-box ai-clip"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >PROCESING: {prompt.substring(0, 20)}...</motion.div>
                 )}
                 {status?.status === 'completed' && <div className="clip-box ai-clip-done">AI OPTIMIZATIONS APPLIED</div>}
              </div>
              <div className="playhead"></div>
           </div>
        </section>

        {/* Global Agent Collaboration Bar */}
        <footer className="footer-bar panel-bg px-24 py-20 border-t border-dim relative z-50">
           <div className="command-bar-wrap relative">
              <form onSubmit={handleCollaboration} className="ai-command-form p-8 glass rounded-2xl flex-row align-center border-strong shadow-float">
                 <div className="ai-icon-bubble flex-center"><Sparkles size={20} className="text-primary"/></div>
                 <input 
                    type="text"
                    className="flex-1 px-16 command-input label-lg"
                    placeholder="Brief the AI Agent on your next move... (e.g. 'Remove silence and upscale')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isBusy || !videoId}
                 />
                 <button 
                   type="submit" 
                   className={`btn-collab flex-row align-center gap-10 ${isBusy ? 'state-busy' : ''}`}
                   disabled={isBusy || !videoId || !prompt.trim()}
                 >
                    {isBusy ? <Loader2 className="animate-spin" size={20}/> : <span className="flex-row align-center gap-8 font-bold">Collaborate <ChevronRight size={18}/></span>}
                 </button>
              </form>
           </div>
           
           <div className="quick-suggestions flex-row gap-10 mt-12 px-12">
              <button className="chip" onClick={() => setPrompt("Remove awkward silences and background noise")}>Quiet Silence</button>
              <button className="chip" onClick={() => setPrompt("Generate high-contrast professional captions")}>Auto-Captions</button>
              <button className="chip" onClick={() => setPrompt("Convert this into a fast-paced cinematic reel")}>Cinematic</button>
              <button className="chip" onClick={() => setPrompt("Extract only the key scenes using scene detection")}>Auto-Cut</button>
           </div>
        </footer>
      </main>

      {/* Extreme Console Sidebar: Judge's View */}
      <aside className="console-sidebar glass border-l border-dim p-20 flex-column gap-16">
         <div className="console-header flex-row align-center gap-10 label-sm text-dim">
            <Terminal size={14}/> <span>Agent Runtime Logs</span>
         </div>
         <div className="console-viewport flex-1 glass rounded-lg p-12 font-mono text-xs overflow-y flex-column gap-6" ref={consoleRef}>
            <div className="text-secondary">[SYS] Initializing kernel...</div>
            <div className="text-secondary">[SYS] Listening at :8001</div>
            {history.map((h, i) => <div key={i} className="text-primary-soft">{h}</div>)}
            {status?.status === 'thinking' && <div className="text-accent animate-pulse"># AGENT BRAINSTORMING...</div>}
            {status?.status === 'processing' && <div className="text-primary"># RENDERING: PIXEL_BUFFER_FLUSH...</div>}
         </div>
         <div className="console-stats flex-column gap-8 label-sm border-t border-dim pt-12">
            <div className="flex-row justify-between"><span>CPU ACCEL</span> <span className="text-primary">ACTIVE</span></div>
            <div className="flex-row justify-between"><span>FFMPEG ENC</span> <span className="text-secondary">LIBX264</span></div>
            <div className="flex-row justify-between"><span>GEMINI V1.5</span> <span className="text-blue">READY</span></div>
         </div>
      </aside>

      <style>{`
        .vh-screen { height: 100vh; }
        .vw-screen { width: 100vw; }
        .flex-row { display: flex; flex-direction: row; }
        .flex-column { display: flex; flex-direction: column; }
        .flex-1 { flex: 1; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .justify-between { justify-content: space-between; }
        .align-center { align-items: center; }
        .gap-6 { gap: 6px; }
        .gap-8 { gap: 8px; }
        .gap-10 { gap: 10px; }
        .gap-12 { gap: 12px; }
        .gap-16 { gap: 16px; }
        .gap-20 { gap: 20px; }
        .gap-24 { gap: 24px; }
        .p-12 { padding: 12px; }
        .p-16 { padding: 16px; }
        .p-20 { padding: 20px; }
        .p-24 { padding: 24px; }
        .p-40 { padding: 40px; }
        .px-12 { padding-left: 12px; padding-right: 12px; }
        .px-16 { padding-left: 16px; padding-right: 16px; }
        .px-24 { padding-left: 24px; padding-right: 24px; }
        .py-8 { padding-top: 8px; padding-bottom: 8px; }
        .py-20 { padding-top: 20px; padding-bottom: 20px; }
        .p-8 { padding: 8px; }
        .mt-12 { margin-top: 12px; }
        .mt-auto { margin-top: auto; }
        .ml-8 { margin-left: 8px; }
        .tracking-widest { letter-spacing: 0.2em; }
        .label-sm { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        .label-md { font-size: 13px; font-weight: 500; }
        .label-lg { font-size: 16px; }
        .font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        .text-xs { font-size: 10px; }
        .overflow-y { overflow-y: auto; }
        .pointer { cursor: pointer; }

        /* Hero Layout */
        .hero-overlay { position: fixed; inset: 0; background: radial-gradient(circle at center, #101115 0%, #050506 100%); z-index: 1000; }
        .hero-card { width: 480px; border-radius: var(--radius-xl); box-shadow: 0 40px 100px -20px var(--primary-glow); }
        .badge-amd { font-size: 10px; font-weight: 900; background: var(--primary); color: white; border-radius: 4px; padding: 4px 10px; }
        .hero-title { font-size: 64px; font-weight: 800; letter-spacing: -2px; }
        .text-primary-soft { color: #ff5c7c; }
        .btn-upload { background: var(--primary); color: white; padding: 16px 32px; border-radius: var(--radius-lg); font-weight: 700; box-shadow: 0 0 30px var(--primary-glow); transition: var(--transition); }
        .btn-upload:hover { transform: scale(1.03); box-shadow: 0 0 50px var(--primary-glow); }

        /* Sidebar */
        .sidebar { width: 300px; z-index: 50; }
        .brand-dot { padding: 8px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 15px var(--primary-glow); }
        .brand-text { font-size: 20px; font-weight: 800; }
        .nav-chip { background: transparent; padding: 6px 14px; border-radius: 20px; color: var(--text-dim); font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; }
        .nav-chip.active { background: rgba(255,255,255,0.05); color: white; border-color: var(--border-soft); }
        
        .asset-tile { aspect-ratio: 16/10; border-radius: var(--radius-md); position: relative; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; }
        .asset-thumb { width:100%; flex: 1; object-fit: cover; opacity: 0.6; }
        .asset-name { position: absolute; bottom: 8px; left: 8px; font-size: 10px; font-weight: 700; color: white; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; }
        .asset-tile.active { border-color: var(--primary); }
        .asset-tile.active .asset-thumb { opacity: 1; }
        .border-dashed { border: 2px dashed var(--border-soft); }

        .history-item { padding: 6px 10px; border-radius: 4px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-dim); color: var(--text-secondary); }

        /* Workspace Header */
        .workspace-nav { height: 72px; z-index: 10; }
        .btn-subtle { width: 40px; height: 40px; background: rgba(255,255,255,0.03); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); transition: var(--transition); }
        .btn-subtle:hover { background: rgba(255,255,255,0.08); color: white; }
        .btn-accent { background: var(--primary); color: white; padding: 10px 24px; border-radius: 10px; font-weight: 700; box-shadow: 0 0 20px var(--primary-glow); }

        /* Preview Stage */
        .glass-stage { background: var(--bg-surface); }
        .main-video { max-height: 100%; max-width: 100%; border-radius: 4px; box-shadow: 0 30px 60px rgba(0,0,0,0.7); }
        .busy-shield { position: absolute; inset:0; background: rgba(0,0,0,0.85); z-index: 200; backdrop-filter: blur(8px); }
        
        .ai-core-cluster { width: 100px; height: 100px; }
        .ai-core-ring { position: absolute; inset: 0; border: 2px solid transparent; border-radius: 50%; }
        .ring-1 { border-top-color: var(--primary); animation: spin 2s infinite linear; }
        .ring-2 { border-right-color: var(--secondary); animation: spin 3s infinite reverse linear; padding: 10px; }
        .ai-core-dot { position: absolute; inset: 40px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 30px var(--primary); }
        @keyframes spin { to { transform: rotate(360deg); } }

        .render-bar-track { width: 320px; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; }
        .render-bar-fill { height: 100%; background: var(--primary); box-shadow: 0 0 15px var(--primary); transition: width 0.4s ease; }
        .progress-pct { font-family: 'Outfit'; font-size: 24px; font-weight: 700; color: white; }

        .transport-hud { width: 420px; left: 50%; transform: translateX(-50%); transition: var(--transition); }
        .btn-play { width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 4px solid rgba(255,255,255,0.1); }

        /* Timeline View */
        .timeline { height: 260px; }
        .track { height: 32px; width: 100%; background: rgba(255,255,255,0.02); border-radius: 4px; position: relative; }
        .clip-box { position: absolute; height: 24px; top:4px; left: 10px; right: 10px; border-radius: 4px; display: flex; align-items: center; padding: 0 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .v-clip { background: linear-gradient(90deg, #1e3a8a, #3b82f6); border: 1px solid #60a5fa; }
        .a-clip { background: linear-gradient(90deg, #064e3b, #10b981); border: 1px solid #34d399; }
        .ai-clip { background: linear-gradient(90deg, #4c1d95, #8b5cf6); border: 1px solid #a78bfa; width: max-content; min-width: 200px; }
        .ai-clip-done { background: linear-gradient(90deg, var(--primary), #ff7b96); border: 1px solid #ffa0b2; }
        .playhead { position: absolute; left: 150px; top:0; bottom:0; width: 2px; background: var(--primary); box-shadow: 0 0 10px var(--primary); }

        /* AI Command Bar */
        .ai-command-form { transition: var(--ease-in-out); background: var(--bg-surface); }
        .ai-command-form:focus-within { border-color: var(--primary); transform: translateY(-4px); box-shadow: 0 20px 60px -10px var(--primary-glow); }
        .ai-icon-bubble { width: 48px; height: 48px; background: var(--bg-panel); border-radius: 50%; }
        .command-input { background: transparent; border: none; color: white; outline: none; font-weight: 500; }
        .btn-collab { background: var(--primary); color: white; padding: 12px 32px; border-radius: 12px; transition: var(--ease-in-out); }
        .btn-collab:not(.state-busy):hover { transform: scale(1.02); background: #ff4d6a; }
        .state-busy { background: var(--bg-card); cursor: not-allowed; opacity: 0.7; }

        .chip { background: rgba(255,255,255,0.03); color: var(--text-secondary); padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid var(--border-dim); transition: var(--transition); }
        .chip:hover { background: var(--bg-hover); color: white; border-color: var(--text-dim); }

        /* Console Sidebar */
        .console-sidebar { width: 320px; background: #08080a; }
        .console-viewport { background: #000; border: 1px solid var(--border-dim); }
        .text-primary-soft { color: #fecaca; }
        .text-primary { color: var(--primary); }
        .text-blue { color: var(--secondary); }
        .text-accent { color: #d8b4fe; }

        @keyframes animate-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: animate-in 0.6s var(--easing); }
      `}</style>
    </div>
  );
};

export default App;
