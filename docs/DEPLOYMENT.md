# Docker 部署和 CI/CD 指南

## 📦 Docker 镜像构建

### 自动构建（GitHub Actions）

#### 触发条件

**1. Push 到 main 分支**
```bash
git push origin main
```
- ✅ 自动构建并推送 `latest` 标签
- ✅ 自动推送 `main-<git-sha>` 标签（用于回滚）

**2. 创建版本标签**
```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```
- ✅ 自动构建并推送 `v1.0.0` 标签
- ✅ 自动推送 `1.0` 标签
- ✅ 同时更新 `latest` 标签

**3. Pull Request**
```bash
# 创建 PR 时会构建但不推送
```
- ✅ 验证构建成功
- ❌ 不推送镜像

**4. 手动触发**
```
GitHub > Actions > Docker Build and Push > Run workflow
```

---

## 🏷️ 镜像标签说明

### 生成的标签示例

当你推送 `v1.2.3` 标签时，会生成以下 Docker 镜像标签：

```
ghcr.io/simongino/r2-gallery-frontend:latest
ghcr.io/simongino/r2-gallery-frontend:v1.2.3
ghcr.io/simongino/r2-gallery-frontend:1.2
ghcr.io/simongino/r2-gallery-frontend:main-abc1234

ghcr.io/simongino/r2-gallery-backend:latest
ghcr.io/simongino/r2-gallery-backend:v1.2.3
ghcr.io/simongino/r2-gallery-backend:1.2
ghcr.io/simongino/r2-gallery-backend:main-abc1234
```

### 标签用途

| 标签 | 用途 | 示例 |
|------|------|------|
| `latest` | 最新稳定版本 | 生产环境默认 |
| `v1.2.3` | 完整语义化版本 | 锁定特定版本 |
| `1.2` | 次版本号 | 获取最新补丁 |
| `main-abc1234` | Git SHA | 精确回滚到某次提交 |

---

## 🚀 部署步骤

### 方式 1：使用 latest 标签（快速部署）

```bash
# 1. 克隆仓库
git clone https://github.com/SimonGino/r2-browse.git
cd r2-browse

# 2. 配置环境变量
cp .env.example .env
nano .env  # 填入你的 R2 凭证

# 3. 拉取最新镜像
docker-compose pull

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

---

### 方式 2：使用特定版本（生产环境推荐）

修改 `docker-compose.yml`：

```yaml
services:
  backend:
    image: ghcr.io/simongino/r2-gallery-backend:v1.0.0  # 指定版本
    # ...

  frontend:
    image: ghcr.io/simongino/r2-gallery-frontend:v1.0.0  # 指定版本
    # ...
```

然后执行：
```bash
docker-compose pull
docker-compose up -d
```

---

## 🔄 版本管理工作流

### 发布新版本

```bash
# 1. 确保代码已提交到 main
git checkout main
git pull origin main

# 2. 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. 推送标签（触发自动构建）
git push origin v1.0.0

# 4. 等待 GitHub Actions 构建完成（约 5-10 分钟）
# 访问：https://github.com/SimonGino/r2-browse/actions

# 5. 验证镜像已推送
docker pull ghcr.io/simongino/r2-gallery-backend:v1.0.0
docker pull ghcr.io/simongino/r2-gallery-frontend:v1.0.0
```

---

### 语义化版本规范

遵循 [SemVer](https://semver.org/lang/zh-CN/) 规范：

```
v主版本号.次版本号.修订号

v1.0.0 → v1.0.1  # 修复 Bug
v1.0.1 → v1.1.0  # 新增功能（向下兼容）
v1.1.0 → v2.0.0  # 破坏性变更
```

**示例：**
```bash
# Bug 修复
git tag v1.0.1 -m "Fix: 修复图片上传失败问题"

# 新功能
git tag v1.1.0 -m "Feat: 添加批量删除功能"

# 破坏性变更
git tag v2.0.0 -m "BREAKING: 移除缩略图功能"
```

---

## 🔙 回滚操作

### 回滚到之前的版本

```bash
# 方式 1：使用版本标签
docker-compose down
# 修改 docker-compose.yml 中的镜像标签为旧版本
docker-compose up -d

# 方式 2：使用 Git SHA（精确回滚）
docker pull ghcr.io/simongino/r2-gallery-backend:main-abc1234
docker pull ghcr.io/simongino/r2-gallery-frontend:main-abc1234
# 修改 docker-compose.yml
docker-compose up -d
```

---

## 🔍 故障排查

### 查看构建日志

```
GitHub > Actions > 选择失败的 workflow > 查看详细日志
```

### 常见问题

#### 1. 镜像拉取失败
```bash
# 检查是否登录 GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 检查镜像是否存在
docker pull ghcr.io/simongino/r2-gallery-backend:latest
```

#### 2. 容器无法启动
```bash
# 查看日志
docker-compose logs backend
docker-compose logs frontend

# 检查环境变量
docker-compose config

# 检查健康状态
docker-compose ps
```

#### 3. 数据库权限问题
```bash
# 修复权限
chmod 666 images.db
chmod 777 .
```

---

## 📊 监控和健康检查

### 查看容器状态

```bash
# 查看所有容器
docker-compose ps

# 查看健康状态
docker inspect r2-gallery-backend | grep -A 5 Health
docker inspect r2-gallery-frontend | grep -A 5 Health
```

### 健康检查端点

- **后端**: `http://localhost:8000/api/images/list?page=1&page_size=1`
- **前端**: `http://localhost:80`

---

## 🎯 最佳实践

### 1. 生产环境部署
- ✅ 使用特定版本标签（如 `v1.0.0`），不要用 `latest`
- ✅ 配置健康检查
- ✅ 配置自动重启：`restart: unless-stopped`
- ✅ 定期备份数据库文件

### 2. 版本发布流程
```bash
# 开发 → 测试 → 发布
1. 在 dev 分支开发
2. 合并到 main 分支（自动构建 latest）
3. 测试 latest 版本
4. 创建版本标签（如 v1.0.0）
5. 生产环境使用版本标签
```

### 3. 安全建议
- ✅ 定期更新基础镜像（`python:3.9-slim`, `nginx:alpine`）
- ✅ 使用 Docker secrets 管理敏感信息
- ✅ 启用容器扫描（GitHub Actions 可集成）

---

## 📝 环境变量管理

### 开发环境
```bash
# backend/.env
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_ACCESS_KEY_ID=xxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxx
BUCKET_NAME=dev-bucket
BUCKET_ENDPOINT=images-dev.yourdomain.com
```

### 生产环境
```bash
# .env (项目根目录)
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_ACCESS_KEY_ID=xxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxx
BUCKET_NAME=prod-bucket
BUCKET_ENDPOINT=images.yourdomain.com
```

---

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/SimonGino/r2-browse/issues
- **Docker 文档**: https://docs.docker.com/
- **GitHub Actions 文档**: https://docs.github.com/actions
