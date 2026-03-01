import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export interface TaskStatus {
    video_id: string;
    status: 'uploaded' | 'thinking' | 'processing' | 'completed' | 'failed';
    progress: number;
    output_url?: string;
    error?: string;
}

export interface EditPlan {
    video_id: string;
    actions: {
        action: string;
        start_time: number;
        end_time: number;
        metadata?: any;
    }[];
}

export interface EditResponse {
    task_id: string;
    plan: EditPlan;
    status: string;
}

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ video_id: string; filename: string; status: string }>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getStatus = async (videoId: string) => {
    const response = await api.get<TaskStatus>(`/status/${videoId}`);
    return response.data;
};

export const editVideo = async (videoId: string, prompt: string) => {
    const response = await api.post<EditResponse>('/edit', null, {
        params: {
            prompt,
            video_id: videoId,
        },
    });
    return response.data;
};

export default api;
