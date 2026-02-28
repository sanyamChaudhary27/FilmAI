import React, { useState, useCallback, useEffect } from 'react';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import PreviewCanvas from './components/PreviewCanvas';
import Timeline from './components/Timeline';
import { uploadVideo, getStatus, editVideo, type TaskStatus } from './services/api';

const App: React.FC = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Status polling
  useEffect(() => {
    let interval: any;
    if (videoId && status?.status !== 'completed' && status?.status !== 'failed') {
      interval = setInterval(async () => {
        try {
          const newStatus = await getStatus(videoId);
          setStatus(newStatus);
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [videoId, status?.status]);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    try {
      const resp = await uploadVideo(file);
      setVideoId(resp.video_id);
      const initialStatus = await getStatus(resp.video_id);
      setStatus(initialStatus);
    } catch (e) {
      console.error('Upload failed:', e);
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!videoId) return;
    try {
      await editVideo(videoId, 'Remove the background from this video');
      const newStatus = await getStatus(videoId);
      setStatus(newStatus);
    } catch (e) {
      console.error('Processing trigger failed:', e);
    }
  }, [videoId]);

  const handleTimeUpdate = useCallback((t: number, dur: number) => {
    setVideoTime(t);
    setVideoDuration(dur);
  }, []);

  return (
    <div className="app-container">
      <TopBar videoId={videoId} status={status} onProcess={handleProcess} />

      <main className="editor-main">
        <LeftSidebar
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadedFileName={uploadedFileName}
        />

        <section className="center-stage">
          <PreviewCanvas
            videoId={videoId}
            status={status}
            onTimeUpdate={handleTimeUpdate}
          />
          <Timeline currentTime={videoTime} duration={videoDuration} />
        </section>

        <RightSidebar onApply={handleProcess} />
      </main>

      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-dark);
          overflow: hidden;
          color: var(--text-main);
        }

        .editor-main {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 0;
        }

        .center-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default App;
