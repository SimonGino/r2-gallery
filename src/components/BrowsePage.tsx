import { useState, useEffect, useRef } from 'react';
import { Theme } from '@radix-ui/themes';
import { DownloadIcon, EyeOpenIcon, CopyIcon, TrashIcon } from '@radix-ui/react-icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import '@radix-ui/themes/styles.css';
import '../styles/waterfall.css';
import * as Toast from '@radix-ui/react-toast';
import Footer from './Footer';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
});

interface R2Object {
    Key?: string;
    LastModified?: Date;
    Size?: number;
    ETag?: string;
}

const BrowsePage = () => {
    const [objects, setObjects] = useState<R2Object[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [nextContinuationToken, setNextContinuationToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadedKeys = useRef(new Set<string>()); // 使用 ref 替代 state

    const fetchObjects = async () => {
        if (isLoading || !hasMore) return;

        try {
            setIsLoading(true);
            const command = new ListObjectsV2Command({
                Bucket: import.meta.env.VITE_BUCKET_NAME,
                MaxKeys: 10,
                ContinuationToken: nextContinuationToken || undefined
            });

            const response = await s3Client.send(command);

            // 过滤重复项并按时间倒序排序
            const newObjects = (response.Contents || [])
                .filter(obj => {
                    if (!obj.Key || loadedKeys.current.has(obj.Key)) return false;
                    loadedKeys.current.add(obj.Key);
                    return true;
                })
                .sort((a, b) => {
                    const timeA = a.LastModified?.getTime() || 0;
                    const timeB = b.LastModified?.getTime() || 0;
                    return timeB - timeA; // 降序排列，最新的在前
                });

            // 合并时保持降序顺序
            setObjects(prev => {
                const mergedObjects = [...prev, ...newObjects];
                return mergedObjects.sort((a, b) => {
                    const timeA = a.LastModified?.getTime() || 0;
                    const timeB = b.LastModified?.getTime() || 0;
                    return timeB - timeA;
                });
            });

            const hasMoreData = !!response.NextContinuationToken;
            setNextContinuationToken(response.NextContinuationToken || null);
            setHasMore(hasMoreData);
        } catch (error) {
            console.error('Error fetching objects:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchObjects();
    }, [nextContinuationToken]);

    const downloadFile = async (key: string) => {
        try {
            const command = new GetObjectCommand({
                Bucket: import.meta.env.VITE_BUCKET_NAME,
                Key: key,
            });
            const response = await s3Client.send(command);
            if (response.Body) {
                const arrayBuffer = await response.Body.transformToByteArray();
                const blob = new Blob([arrayBuffer], { type: response.ContentType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = key.split('/').pop() || key;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            showToast('下载失败');
        }
    };

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastOpen(true);
    };

    const copyLink = async (key: string) => {
        try {
            const url = `https://${import.meta.env.VITE_BUCKET_ENDPOINT}/${encodeURIComponent(key)}`;
            await navigator.clipboard.writeText(url);
            showToast('链接已复制到剪贴板');
        } catch (error) {
            console.error('Error copying link:', error);
            showToast('复制链接失败');
        }
    };

    const deleteFile = async (key: string) => {
        if (!window.confirm('确定要删除这张图片吗？')) {
            return;
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: import.meta.env.VITE_BUCKET_NAME,
                Key: key,
            });
            await s3Client.send(command);
            setObjects(prev => prev.filter(obj => obj.Key !== key));
            loadedKeys.current.delete(key);
            showToast('删除成功');
        } catch (error) {
            console.error('Error deleting file:', error);
            showToast('删除失败');
        }
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return new Date(date).toLocaleString();
    };

    const isImageFile = (key: string) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return imageExtensions.some(ext => key.toLowerCase().endsWith(ext));
    };

    return (
        <Theme>
            <Toast.Provider swipeDirection="right">
                <div style={{ height: '100vh' }}>
                    <div style={{ height: 'calc(100vh - 37px', overflow: 'auto' }}>
                        <Toast.Root
                            className="bg-white rounded-lg shadow-lg p-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut"
                            open={toastOpen}
                            onOpenChange={setToastOpen}
                            duration={2000}
                        >
                            <Toast.Description>{toastMessage}</Toast.Description>
                        </Toast.Root>
                        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 m-0 list-none z-[100] outline-none" />
                        <div className="min-h-screen bg-gray-100 p-4">
                            <div className="max-w-6xl mx-auto">
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-800">图片浏览</h1>
                                    <a href="/upload" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                        上传图片
                                    </a>
                                </div>

                                <InfiniteScroll
                                    dataLength={objects.length}
                                    next={fetchObjects}
                                    hasMore={hasMore}
                                    scrollThreshold="800px"
                                    loader={<div className="loading">加载中...</div>}
                                    endMessage={<div className="no-more">没有更多图片了</div>}
                                    className="waterfall-container"
                                >
                                    {!isLoading && objects.length === 0 && (
                                        <div className="empty-state">暂无图片</div>
                                    )}
                                    <div className="waterfall-wrapper">
                                        {objects
                                            .filter(obj => obj.Key && isImageFile(obj.Key))
                                            .map((object) => (
                                            <div key={object.Key} className="waterfall-item">
                                                <div className="image-wrapper">
                                                    <img
                                                        src={`https://${import.meta.env.VITE_BUCKET_ENDPOINT}/${encodeURIComponent(object.Key || '')}`}
                                                        alt={object.Key}
                                                        loading="lazy"
                                                    />
                                                    <div className="image-overlay flex flex-col justify-between p-4">
                                                        <div className="image-actions flex justify-end gap-2">
                                                            <button onClick={() => object.Key && downloadFile(object.Key)} title="下载" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                                <DownloadIcon className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => window.open(`https://${import.meta.env.VITE_BUCKET_ENDPOINT}/${encodeURIComponent(object.Key || '')}`, '_blank')} title="查看原图" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                                <EyeOpenIcon className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => object.Key && copyLink(object.Key)} title="复制链接" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                                <CopyIcon className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => object.Key && deleteFile(object.Key)} title="删除" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="image-info bg-black/50 text-white p-2 rounded flex justify-between items-center mt-2">
                                                            <span>{formatSize(object.Size)}</span>
                                                            <span>{formatDate(object.LastModified)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </InfiniteScroll>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: '37px' }}>
                        <Footer />
                    </div>
                </div>
            </Toast.Provider>
        </Theme>
    );
};

export default BrowsePage;