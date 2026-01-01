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

#### 方式 1：使用 uv（推荐）

1. 进入后端目录：
```bash
cd backend
```

2. 复制环境变量模板并配置 R2 凭证：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 Cloudflare R2 凭证
```

3. 使用 uv 创建虚拟环境（需要 Python 3.9）：
```bash
# 安装 uv（如果尚未安装）
# curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建 Python 3.9 虚拟环境
uv venv --python 3.9

# 激活虚拟环境
source .venv/bin/activate  # macOS/Linux
# 或
.venv\Scripts\activate  # Windows
```

4. 安装依赖：
```bash
uv pip install -e .
```

5. 启动开发服务器：
```bash
uvicorn src.main:app --reload --port 8000
```

#### 方式 2：使用 PDM

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
pdm run start
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

前端将在 http://localhost:5173 上运行，并将 API 请求代理到后端 http://localhost:8000。

### 同时运行前后端

打开两个终端窗口：

**终端 1 - 后端：**
```bash
cd backend
source .venv/bin/activate  # 如果使用 uv
uvicorn src.main:app --reload --port 8000
```

**终端 2 - 前端：**
```bash
cd frontend
npm run dev
```

## 生产环境部署

1. 从 GitHub Container Registry 拉取镜像：
```bash
docker-compose pull
```

2. 在项目根目录创建 .env 文件并配置你的 R2 凭证：
```bash
CLOUDFLARE_ACCOUNT_ID=你的账号ID
CLOUDFLARE_ACCESS_KEY_ID=你的访问密钥ID
CLOUDFLARE_SECRET_ACCESS_KEY=你的访问密钥
BUCKET_NAME=你的存储桶名称
BUCKET_ENDPOINT=你的存储桶访问端点
```

3. 启动容器：
```bash
docker-compose up -d
```

应用将在 http://localhost:80 上可访问

## 功能特性

- 图片上传
- 支持无限滚动的图片库
- 图片预览和下载
- 响应式设计
- 自动与 R2 存储同步
- Gzip 压缩提升性能
- Docker 支持便捷部署
- **Cloudflare CDN 缓存支持**（可选，免费）

## 性能优化

### Cloudflare CDN 缓存（推荐）

为了获得最佳性能和最低成本，强烈建议配置 Cloudflare CDN 缓存：

**优势：**
- ✅ 响应速度提升 **10 倍**（500ms → 50ms）
- ✅ 成本降低 **95%**
- ✅ 全球 300+ CDN 节点加速
- ✅ **完全免费**

**配置步骤：**
详见 [Cloudflare CDN 缓存配置指南](./docs/CDN-SETUP-GUIDE.md)

快速步骤：
1. 在 Cloudflare Dashboard 中将 R2 bucket 绑定到自定义域名（如 `images.yourdomain.com`）
2. 配置 Page Rule：Cache Level = Cache Everything
3. 修改 `.env` 中的 `BUCKET_ENDPOINT` 为你的自定义域名

## 环境变量

### 后端

- `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare 账号 ID
- `CLOUDFLARE_ACCESS_KEY_ID`：R2 访问密钥 ID
- `CLOUDFLARE_SECRET_ACCESS_KEY`：R2 访问密钥
- `BUCKET_NAME`：R2 存储桶名称
- `BUCKET_ENDPOINT`：R2 存储桶访问端点
  - 推荐：自定义域名（如 `images.yourdomain.com`）以启用 CDN 缓存
  - 备选：R2 直连 URL（如 `pub-xxxxx.r2.dev`）

## 📚 项目文档

所有技术文档位于 [docs](./docs/) 目录：

- [后端技术流程分析](./docs/backend-flow-analysis.md) - 系统架构、数据流向、性能优化
- [Cloudflare CDN 缓存配置指南](./docs/CDN-SETUP-GUIDE.md) - 完整的 CDN 免费配置教程

## 贡献

欢迎提交 Pull Request。对于重大变更，请先开 Issue 讨论你想要改变的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
