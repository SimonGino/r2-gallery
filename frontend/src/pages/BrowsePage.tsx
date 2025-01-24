import { useState, useEffect, useRef } from 'react';
import { Theme } from '@radix-ui/themes';
import { DownloadIcon, EyeOpenIcon, CopyIcon, TrashIcon } from '@radix-ui/react-icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { R2Object } from '../types';
import {  useToast } from '../components/Toast/Toast';
import Footer from '../components/Footer';
import { listImages, downloadImage, deleteImage } from '../utils/api';
import { formatSize, formatDate, isImageFile } from '../utils/format';
import '@radix-ui/themes/styles.css';
import '../styles/waterfall.css';

const BrowsePage = () => {
    const [objects, setObjects] = useState<R2Object[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const loadedKeys = useRef(new Set<string>());
    const isInitialLoad = useRef(true);
    const { Toast, showToast } = useToast();

    const fetchObjects = async () => {
        if (isLoading || !hasMore) {
            console.log('Skip fetching:', { isLoading, hasMore, currentPage });
            return;
        }

        try {
            setIsLoading(true);
            console.log('Fetching page:', currentPage);
            const data = await listImages({ page: currentPage });
            console.log('Fetched data:', data);

            const newObjects = data.items.filter(obj => {
                if (!obj.key || loadedKeys.current.has(obj.key)) return false;
                loadedKeys.current.add(obj.key);
                return true;
            });

            setObjects(prev => [...prev, ...newObjects]);
            setHasMore(data.has_more);
            
            if (data.has_more && !isInitialLoad.current) {
                setCurrentPage(prev => prev + 1);
            }
            isInitialLoad.current = false;
        } catch (error) {
            console.error('Error fetching objects:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('Initial load effect');
        fetchObjects();
    }, []);

    const downloadFile = async (key: string) => {
        try {
            const blob = await downloadImage(key);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = key.split('/').pop() || key;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            showToast('下载失败');
        }
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

    const handleDelete = async (key: string) => {
        if (!window.confirm('确定要删除这张图片吗？')) {
            return;
        }

        try {
            await deleteImage(key);
            setObjects(prev => prev.filter(obj => obj.key !== key));
            loadedKeys.current.delete(key);
            showToast('删除成功');
        } catch (error) {
            console.error('Error deleting file:', error);
            showToast('删除失败');
        }
    };

    return (
        <Theme>
            <div style={{ height: '100vh' }}>
                <div style={{ height: 'calc(100vh - 37px)', overflow: 'auto' }} id="scrollableDiv">
                    <Toast />
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
                                loader={<div className="loading">加载中...</div>}
                                endMessage={<div className="no-more">没有更多图片了</div>}
                                scrollThreshold="50px"
                                scrollableTarget="scrollableDiv"
                                className="waterfall-container"
                            >
                                {!isLoading && objects.length === 0 && (
                                    <div className="empty-state">暂无图片</div>
                                )}
                                <div className="waterfall-wrapper">
                                    {objects
                                        .filter(obj => obj.key && isImageFile(obj.key))
                                        .map((object) => (
                                        <div key={object.key} className="waterfall-item">
                                            <div className="image-wrapper">
                                                <img
                                                    src={object.url}
                                                    alt={object.key}
                                                    loading="lazy"
                                                />
                                                <div className="image-overlay flex flex-col justify-between p-4">
                                                    <div className="image-actions flex justify-end gap-2">
                                                        <button onClick={() => object.key && downloadFile(object.key)} title="下载" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                            <DownloadIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => window.open(object.url, '_blank')} title="查看原图" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                            <EyeOpenIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => object.key && copyLink(object.key)} title="复制链接" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                            <CopyIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => object.key && handleDelete(object.key)} title="删除" className="p-2 hover:bg-gray-200 rounded-full bg-white/80">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="image-info bg-black/50 text-white p-2 rounded flex justify-between items-center mt-2">
                                                        <span>{formatSize(object.size)}</span>
                                                        <span>{formatDate(new Date(object.last_modified))}</span>
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
        </Theme>
    );
};

export default BrowsePage;