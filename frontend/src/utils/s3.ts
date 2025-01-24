import { S3Client } from '@aws-sdk/client-s3';

// 集中管理 S3 客户端配置
export const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
}); 