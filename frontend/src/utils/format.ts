import { SUPPORTED_IMAGE_TYPES } from '../constants';

// 提取通用的格式化函数
export const formatSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleString();
};

export const isImageFile = (key: string): boolean => {
    return SUPPORTED_IMAGE_TYPES.some(ext => key.toLowerCase().endsWith(ext));
}; 