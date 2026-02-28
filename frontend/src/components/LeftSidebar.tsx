import React, { useState, useRef } from 'react';
import { Search, Folder, Grid, Plus, Upload, Loader2, Film } from 'lucide-react';

interface LeftSidebarProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
    uploadedFileName?: string | null;
}

const AssetCard: React.FC<{ name: string; duration: string; icon: string }> = ({ name, duration, icon }) => (
    <div className="asset-grid-item">
        <div className="thumb-container">
            <span className="emoji-icon">{icon}</span>
            <div className="duration-tag">{duration}</div>
        </div>
        <div className="asset-info">
            <span className="asset-name">{name}</span>
            <span className="asset-type">Stock Clip</span>
        </div>
    </div>
);

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onUpload, isUploading, uploadedFileName }) => {
    const [activeTab, setActiveTab] = useState<'broll' | 'uploaded'>('broll');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
            setActiveTab('uploaded');
        }
        // reset so same file can be re-selected
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('video/')) {
            onUpload(file);
            setActiveTab('uploaded');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const brollAssets = [
        { name: 'City Timelapse', duration: '0:12', icon: '🌆' },
        { name: 'Ocean Waves', duration: '0:08', icon: '🌊' },
        { name: 'Forest Aerial', duration: '0:15', icon: '🌲' },
        { name: 'Neon Streets', duration: '0:10', icon: '🏙️' },
        { name: 'Mountain Fog', duration: '0:20', icon: '⛰️' },
        { name: 'Rain Drops', duration: '0:06', icon: '🌧️' },
    ].filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <aside className="left-sidebar glass">
            <div className="tabs">
                <button
                    className={activeTab === 'broll' ? 'active' : ''}
                    onClick={() => setActiveTab('broll')}
                >
                    <Grid size={15} /> B-Roll
                </button>
                <button
                    className={activeTab === 'uploaded' ? 'active' : ''}
                    onClick={() => setActiveTab('uploaded')}
                >
                    <Folder size={15} /> Uploaded
                </button>
            </div>

            <div className="search-bar">
                <Search size={14} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Scrollable asset area */}
            <div className="asset-grid scroll-y">
                {activeTab === 'broll' ? (
                    brollAssets.length > 0 ? (
                        brollAssets.map(a => (
                            <AssetCard key={a.name} name={a.name} duration={a.duration} icon={a.icon} />
                        ))
                    ) : (
                        <div className="no-results">No clips match "{searchQuery}"</div>
                    )
                ) : (
                    uploadedFileName ? (
                        <div className="uploaded-item">
                            <Film size={24} className="text-primary" />
                            <span className="uploaded-name">{uploadedFileName}</span>
                            <span className="uploaded-badge">Uploaded</span>
                        </div>
                    ) : (
                        <div className="empty-uploaded">
                            <span className="text-muted" style={{ fontSize: 12 }}>No videos uploaded yet</span>
                        </div>
                    )
                )}
            </div>

            {/* Always-visible upload zone */}
            <div
                className={`upload-zone ${isUploading ? 'uploading' : ''}`}
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {isUploading ? (
                    <>
                        <Loader2 size={22} className="animate-spin text-primary" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <Upload size={20} className="text-muted" />
                        <span>Drop video or click to upload</span>
                    </>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden-input"
                accept="video/*"
            />

            <button className="browse-btn">
                <Plus size={16} /> Browse Stock Library
            </button>

            <style>{`
                .left-sidebar {
                    width: var(--sidebar-left-width);
                    height: calc(100vh - var(--topbar-height));
                    display: flex;
                    flex-direction: column;
                    padding: 16px;
                    border-right: 1px solid var(--border);
                    background: var(--bg-sidebar);
                    overflow: hidden;
                }

                .hidden-input { display: none; }

                .tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 14px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 4px;
                    flex-shrink: 0;
                }

                .tabs button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    position: relative;
                }

                .tabs button:hover {
                    color: var(--text-main);
                    background: rgba(255,255,255,0.05);
                }

                .tabs button.active { color: var(--primary); }

                .tabs button.active::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0; right: 0;
                    height: 2px;
                    background: var(--primary);
                    box-shadow: 0 -2px 8px var(--primary-glow);
                }

                .search-bar {
                    position: relative;
                    margin-bottom: 14px;
                    flex-shrink: 0;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }

                .search-bar input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px 12px 10px 36px;
                    color: var(--text-main);
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .search-bar input:focus {
                    border-color: rgba(0,194,255,0.3);
                }

                .search-bar input::placeholder { color: var(--text-muted); }

                .asset-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    padding-bottom: 8px;
                }

                .no-results {
                    grid-column: span 2;
                    text-align: center;
                    font-size: 12px;
                    color: var(--text-muted);
                    padding: 24px 0;
                }

                .uploaded-item {
                    grid-column: span 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    padding: 20px;
                    background: rgba(0,194,255,0.04);
                    border: 1px solid rgba(0,194,255,0.15);
                    border-radius: 12px;
                }

                .uploaded-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    text-align: center;
                    word-break: break-all;
                }

                .uploaded-badge {
                    font-size: 10px;
                    background: rgba(16,185,129,0.15);
                    color: var(--accent);
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .empty-uploaded {
                    grid-column: span 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 0;
                }

                /* Always-visible upload zone */
                .upload-zone {
                    flex-shrink: 0;
                    margin: 10px 0;
                    border: 2px dashed var(--border);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                    min-height: 72px;
                }

                .upload-zone:hover, .upload-zone.uploading {
                    border-color: var(--primary);
                    background: rgba(0,194,255,0.04);
                    color: var(--primary);
                }

                .asset-grid-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    cursor: pointer;
                }

                .thumb-container {
                    aspect-ratio: 16/10;
                    background: rgba(255,255,255,0.03);
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 0.2s;
                }

                .asset-grid-item:hover .thumb-container {
                    border-color: var(--primary);
                    background: rgba(0,194,255,0.05);
                    transform: translateY(-2px);
                }

                .emoji-icon { font-size: 22px; }

                .duration-tag {
                    position: absolute;
                    bottom: 5px;
                    left: 5px;
                    background: rgba(0,0,0,0.65);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    color: white;
                }

                .asset-info { display: flex; flex-direction: column; gap: 2px; }
                .asset-name { font-size: 11px; font-weight: 600; color: var(--text-main); }
                .asset-type { font-size: 10px; color: var(--text-muted); }

                .browse-btn {
                    flex-shrink: 0;
                    background: rgba(0,194,255,0.08);
                    border: 1px dashed var(--primary);
                    color: var(--primary);
                    width: 100%;
                    padding: 11px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .browse-btn:hover {
                    background: rgba(0,194,255,0.13);
                    box-shadow: 0 4px 12px rgba(0,194,255,0.1);
                }

                .text-primary { color: var(--primary); }
                .text-muted { color: var(--text-muted); }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </aside>
    );
};

export default LeftSidebar;
