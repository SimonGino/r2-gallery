import { useState, useEffect, useRef } from "react";
import { Theme } from "@radix-ui/themes";
import {
  DownloadIcon,
  EyeOpenIcon,
  CopyIcon,
  TrashIcon,
  GearIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import type { R2Object } from "../types";
import { useToast } from "../components/Toast/Toast";
import Footer from "../components/Footer";
import LazyImage from "../components/LazyImage";
import ImageViewer from "../components/ImageViewer";
import {
  listImages,
  downloadImage,
  deleteImage,
  syncImages,
} from "../utils/api";
import { formatSize, formatDate, isImageFile } from "../utils/format";
import "@radix-ui/themes/styles.css";
import "../styles/waterfall.css";

const BrowsePage = () => {
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [columnCount, setColumnCount] = useState(() => {
    const saved = localStorage.getItem("columnCount");
    return saved ? parseInt(saved, 10) : 3; // Default to 3 columns for better loading performance
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const loadedKeys = useRef(new Set<string>());
  const { Toast, showToast } = useToast();

  const fetchObjects = async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      console.log("当前请求页码:", currentPage);
      const data = await listImages({ page: currentPage });

      const newObjects = data.items.filter(
        (obj) => obj.key && !loadedKeys.current.has(obj.key),
      );
      newObjects.forEach((obj) => loadedKeys.current.add(obj.key!));

      setObjects((prev) => [...prev, ...newObjects]);
      setHasMore(data.has_more);

      // 修改2: 移除自动翻页逻辑
    } catch (error) {
      console.error("加载失败:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false); // 标记首次加载完成
    }
  };

  // 新增 useEffect 监听 currentPage
  useEffect(() => {
    if (isFirstLoad) {
      // 初始加载强制请求
      fetchObjects();
    } else {
      // 后续由页码变化触发
      fetchObjects();
    }
  }, [currentPage]); // ✅ 统一监听页码变化

  const downloadFile = async (key: string) => {
    try {
      const blob = await downloadImage(key);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = key.split("/").pop() || key;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      showToast("下载失败");
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("链接已复制到剪贴板");
    } catch (error) {
      console.error("Error copying link:", error);
      showToast("复制链接失败");
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm("确定要删除这张图片吗？")) {
      return;
    }

    try {
      await deleteImage(key);
      setObjects((prev) => prev.filter((obj) => obj.key !== key));
      loadedKeys.current.delete(key);
      showToast("删除成功");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("删除失败");
    }
  };

  const handleColumnCountChange = (count: number) => {
    setColumnCount(count);
    localStorage.setItem("columnCount", count.toString());
    setIsSettingsOpen(false);
  };

  const handleSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await syncImages();
      showToast("同步成功");
      // 直接刷新页面
      window.location.reload();
    } catch (error) {
      console.error("同步失败:", error);
      showToast("同步失败");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Theme>
      <div style={{ height: "100vh" }}>
        <div
          style={{ height: "calc(100vh - 37px)", overflow: "auto" }}
          id="scrollableDiv"
        >
          <Toast />
          {isSyncing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg">同步中，请稍候...</p>
              </div>
            </div>
          )}
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">图片浏览</h1>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="布局设置"
                  >
                    <GearIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md ${isSyncing ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
                  >
                    <UpdateIcon
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "同步中..." : "同步"}
                  </button>
                  <a
                    href="/upload"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    上传图片
                  </a>
                </div>
              </div>

              <Dialog.Root
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
              >
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white p-6 rounded-lg shadow-xl animate-fade-in">
                    <Dialog.Title className="text-lg font-semibold mb-4">
                      布局设置
                    </Dialog.Title>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600">列数</label>
                        <div className="flex gap-2">
                          {[3, 4, 5].map((count) => (
                            <button
                              key={count}
                              onClick={() => handleColumnCountChange(count)}
                              className={`flex-1 py-2 px-4 rounded ${columnCount === count ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                              {count}列
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <ImageViewer
                images={objects.filter(
                  (obj) => obj.key && isImageFile(obj.key),
                )}
                currentIndex={selectedImageIndex}
                onClose={() => setSelectedImageIndex(-1)}
              />

              <InfiniteScroll
                dataLength={objects.length}
                next={() => {
                  if (!isLoading && hasMore && !isSyncing) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
                hasMore={hasMore}
                loader={<div className="loading">加载中...</div>}
                endMessage={<div className="no-more">没有更多图片了</div>}
                scrollThreshold="300px"
                scrollableTarget="scrollableDiv"
                className="waterfall-container"
              >
                {!isLoading && objects.length === 0 && (
                  <div className="empty-state">暂无图片</div>
                )}
                <Masonry
                  breakpointCols={{
                    default: columnCount,
                    1536: columnCount,
                    1280: columnCount,
                    1024: columnCount,
                    768: 2,
                    640: 1,
                  }}
                  className="waterfall-wrapper"
                  columnClassName="waterfall-column"
                >
                  {objects
                    .filter((obj) => obj.key && isImageFile(obj.key))
                    .map((object, index) => (
                      <div key={object.key} className="waterfall-item">
                        <LazyImage
                          src={object.url}
                          alt={object.key}
                          width={object.width}
                          height={object.height}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <div className="image-overlay flex flex-col justify-between p-4">
                            <div className="image-actions flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  object.key && downloadFile(object.key);
                                }}
                                title="下载"
                                className="p-2 hover:bg-gray-200 rounded-full bg-white/80"
                              >
                                <DownloadIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(index);
                                }}
                                title="查看原图"
                                className="p-2 hover:bg-gray-200 rounded-full bg-white/80"
                              >
                                <EyeOpenIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyLink(object.url);
                                }}
                                title="复制链接"
                                className="p-2 hover:bg-gray-200 rounded-full bg-white/80"
                              >
                                <CopyIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  object.key && handleDelete(object.key);
                                }}
                                title="删除"
                                className="p-2 hover:bg-gray-200 rounded-full bg-white/80"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="image-info bg-black/50 text-white p-2 rounded flex justify-between items-center mt-2">
                              <span>{formatSize(object.size)}</span>
                              <span>
                                {formatDate(new Date(object.last_modified))}
                              </span>
                            </div>
                          </div>
                        </LazyImage>
                      </div>
                    ))}
                </Masonry>
              </InfiniteScroll>
            </div>
          </div>
        </div>
        <div style={{ height: "37px" }}>
          <Footer />
        </div>
      </div>
    </Theme>
  );
};

export default BrowsePage;
