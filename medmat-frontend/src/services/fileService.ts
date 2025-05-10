// src/services/fileService.ts
import apiClient from './api';
import type { UploadedFile } from '../types';

interface UploadFilePayload {
    file: File;
    batch: number;
    discussion_type: number;
    schedule?: number | null;
    description?: string;
}

export const uploadFile = async (payload: UploadFilePayload): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('batch', String(payload.batch));
    formData.append('discussion_type', String(payload.discussion_type));
    if (payload.schedule) {
        formData.append('schedule', String(payload.schedule));
    }
    if (payload.description) {
        formData.append('description', payload.description);
    }

    const response = await apiClient.post<UploadedFile>('/files/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        // onUploadProgress: progressEvent => { // Example for progress, needs frontend state update
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        //   console.log(percentCompleted);
        // }
    });
    return response.data;
};

interface GetFilesParams {
    batch_id?: number;
    discussion_type_id?: number;
    schedule_id?: number;
    uploader_id?: number;
    ordering?: string;
}

export const getFiles = async (params?: GetFilesParams): Promise<UploadedFile[]> => {
    const response = await apiClient.get<UploadedFile[]>('/files/', { params });
    return response.data;
};

export const getFileDetails = async (fileId: number): Promise<UploadedFile> => {
    const response = await apiClient.get<UploadedFile>(`/files/${fileId}/`);
    return response.data;
};

export const deleteFile = async (fileId: number): Promise<void> => {
    await apiClient.delete(`/files/${fileId}/`);
};

interface UpdateFilePayload {
    description?: string;
}
export const updateFileMetadata = async (fileId: number, payload: UpdateFilePayload): Promise<UploadedFile> => {
    const response = await apiClient.patch<UploadedFile>(`/files/${fileId}/`, payload);
    return response.data;
};


// NEW: Programmatic File Download
// This function will use the dedicated Django download view
export const downloadFileProgrammatically = async (fileId: number, originalFilename: string): Promise<void> => {
    try {
        // The URL points to your Django view that serves the file with Content-Disposition: attachment
        const response = await apiClient.get(`/download-file/${fileId}/`, {
            responseType: 'blob', // Crucial: tells Axios to expect binary data
        });

        // Create a Blob from the response data
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });

        // Create a link element, force a click, and then remove it
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalFilename); // Set the desired filename
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        console.error('Download error:', error);
        // Try to parse a JSON error response from the blob if the request failed
        if (error.response && error.response.data instanceof Blob && error.response.data.type === 'application/json') {
            try {
                const errorJson = JSON.parse(await error.response.data.text());
                throw new Error(errorJson.detail || 'File download failed due to a server error.');
            } catch {
                throw new Error('File download failed and error response could not be parsed.');
            }
        } else if (error.response && error.response.data && error.response.data.detail) {
            throw new Error(error.response.data.detail);
        }
        throw new Error(error.message || 'File download failed. Please check network or permissions.');
    }
};