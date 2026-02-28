import axios from 'axios';

const API_BASE = 'http://localhost:8001';

export interface TaskStatus {
    video_id: string;
    status: 'uploaded' | 'thinking' | 'processing' | 'completed' | 'failed';
    progress: number;
    output_url?: string;
    error?: string;
    plan?: any;
    logs?: string[];
}

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

export const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return resp.data; // { video_id, filename, status }
};

export const editVideo = async (videoId: string, prompt: string) => {
    const resp = await api.post('/edit', null, {
        params: { video_id: videoId, prompt }
    });
    return resp.data; // { task_id, plan, status }
};

export const getStatus = async (videoId: string) => {
    const resp = await api.get(`/status/${videoId}`);
    return resp.data as TaskStatus;
};

export default api;
