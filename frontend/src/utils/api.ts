import type { R2Object, ImageListResponse, ImageListParams } from '../types';

export async function listImages({ page, page_size = 10 }: ImageListParams): Promise<ImageListResponse> {
    const response = await fetch(
        `/api/images/list?page_size=${page_size}&page=${page}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch images');
    }
    return response.json();
}

export async function uploadImage(file: File): Promise<R2Object> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
    return response.json();
}

export async function syncImages(): Promise<{ message: string }> {
    const response = await fetch('/api/images/sync', {
        method: 'POST'
    });
    if (!response.ok) {
        throw new Error('Failed to sync images');
    }
    return response.json();
}

export async function deleteImage(key: string): Promise<void> {
    const response = await fetch(`/api/images/${encodeURIComponent(key)}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete image');
    }
}

export async function downloadImage(key: string): Promise<Blob> {
    const response = await fetch(`/api/images/download/${encodeURIComponent(key)}`);
    if (!response.ok) {
        throw new Error('Failed to download image');
    }
    return response.blob();
}