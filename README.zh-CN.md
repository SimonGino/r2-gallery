# R2 图片库

[English](./README.md)

一个现代化的响应式Web应用，用于管理和展示存储在Cloudflare R2中的图片。使用React和TypeScript构建，具有美观的瀑布流布局和拖拽上传功能。

## 功能特点

- 🖼️ 美观的瀑布流图片展示
- 📤 拖拽式图片上传
- 🔄 无限滚动浏览
- 📱 全设备响应式设计
- 🚀 基于Cloudflare R2存储的高效性能
- 🎨 使用Radix UI和Tailwind CSS的现代界面

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- AWS SDK（用于Cloudflare R2）
- React Router
- React Dropzone

## 前置要求

- Node.js 16+
- 启用了R2存储的Cloudflare账户
- R2存储桶和访问凭证

## 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/r2-gallery.git
cd r2-gallery
```

2. 安装依赖：

```bash
npm install
```

3. 在根目录创建`.env`文件并添加Cloudflare R2凭证：

```env
VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id
VITE_CLOUDFLARE_SECRET_ACCESS_KEY=your_access_key
VITE_BUCKET_NAME=your_bucket_name
VITE_BUCKET_ENDPOINT=your_endpoint_name
```

4. 启动开发服务器：

```bash
npm run dev
```

5. 构建生产版本：

```bash
npm run build
```

## 使用说明

### 浏览图片

- 主页以瀑布流布局展示所有图片
- 向下滚动自动加载更多图片
- 点击图片操作按钮可以：
  - 下载图片
  - 查看原图
  - 复制图片链接
  - 删除图片

### 上传图片

1. 点击"上传图片"按钮
2. 将图片拖放到上传区域或点击选择文件
3. 支持的格式：JPG、JPEG、PNG、GIF、WEBP
4. 查看上传进度和确认信息

## Docker支持

使用Docker运行应用：

```bash
docker build -t r2-gallery .
docker run -p 5173:5173 r2-gallery
```

## 许可证

MIT