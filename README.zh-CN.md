# R2 图片库
[English](./README.md)

一个用于管理和浏览存储在 Cloudflare R2 存储中的图片的现代化 Web 应用。

## Demo
![Demo](https://oss.mytest.cc/Snipaste_2025-01-24_13-39-25.png)
## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- AWS SDK（用于 Cloudflare R2）
- React Router
- React Dropzone
- FastAPI（后端）
- SQLite
- Docker & Docker Compose

## 环境要求

- Node.js 20+
- Python 3.9+
- Docker 和 Docker Compose（用于生产环境部署）
- Cloudflare R2 存储账号

## 开发环境搭建

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 复制环境变量模板并配置 R2 凭证：
```bash
cp .env.example .env
```

3. 使用 PDM 安装依赖：
```bash
pip install pdm
pdm install
```

4. 启动开发服务器：
```bash
pdm run dev
```

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

## 生产环境部署

1. 在 `.env` 文件中配置环境变量

2. 构建并启动容器：
```bash
docker-compose up -d --build
```

应用将在 http://localhost:80 上可访问

## 功能特性

- 图片上传并自动生成缩略图
- 支持无限滚动的图片库
- 图片预览和下载
- 响应式设计
- 自动与 R2 存储同步
- Gzip 压缩提升性能
- Docker 支持便捷部署

## 环境变量

### 后端

- `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare 账号 ID
- `CLOUDFLARE_ACCESS_KEY_ID`：R2 访问密钥 ID
- `CLOUDFLARE_SECRET_ACCESS_KEY`：R2 访问密钥
- `BUCKET_NAME`：R2 存储桶名称
- `BUCKET_ENDPOINT`：R2 存储桶访问端点

## 贡献

欢迎提交 Pull Request。对于重大变更，请先开 Issue 讨论你想要改变的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)