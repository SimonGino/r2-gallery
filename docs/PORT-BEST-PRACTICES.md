# 端口暴露最佳实践

## 🔒 生产环境：只暴露前端端口

### 为什么？

1. **安全性** - 后端 API 不应该直接暴露到公网
2. **访问控制** - 所有请求必须经过前端 Nginx（可以添加认证、限流等）
3. **简化管理** - 只需要管理一个对外端口

### 配置

```yaml
# docker-compose.yml (生产环境)
services:
  backend:
    # ❌ 不暴露端口
    # ports:
    #   - "8000:8000"
    
  frontend:
    ports:
      - "80:80"  # ✅ 只暴露前端
```

---

## 🛠️ 开发环境：暴露后端端口

### 为什么？

1. **调试方便** - 直接访问 FastAPI 文档 (`http://localhost:8000/docs`)
2. **API 测试** - 使用 Postman/curl 直接测试
3. **性能分析** - 直接访问后端 API 进行性能测试

### 配置

使用 `docker-compose.dev.yml` 覆盖配置：

```bash
# 开发环境启动
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 访问
# 前端：http://localhost:5173
# 后端 API：http://localhost:8000/api/images/list
# FastAPI 文档：http://localhost:8000/docs
```

---

## 🌐 网络架构对比

### 生产环境（推荐）

```
Internet
  │
  └─→ Frontend:80 (公开)
        │
        └─→ Backend:8000 (内部网络，不可直接访问)
```

**优势：**
- ✅ Backend 完全隐藏
- ✅ 可以在 Nginx 添加访问控制
- ✅ 统一入口，便于监控

### 开发环境

```
Localhost
  ├─→ Frontend:5173
  └─→ Backend:8000 (可直接访问)
```

**优势：**
- ✅ 方便调试
- ✅ 可以直接测试 API
- ✅ 查看 FastAPI 自动文档

---

## 📋 命令对照表

| 场景 | 命令 |
|------|------|
| **生产部署** | `docker-compose up -d` |
| **开发调试** | `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d` |
| **查看日志** | `docker-compose logs -f` |
| **停止服务** | `docker-compose down` |

---

## 🔐 安全建议

### 如果必须暴露后端端口（不推荐）

1. **使用非标准端口**
   ```yaml
   ports:
     - "38000:8000"  # 使用高位端口
   ```

2. **配置防火墙**
   ```bash
   # 只允许特定 IP 访问
   iptables -A INPUT -p tcp --dport 38000 -s 192.168.1.100 -j ACCEPT
   iptables -A INPUT -p tcp --dport 38000 -j DROP
   ```

3. **添加 API 认证**
   - 在后端添加 JWT 认证
   - 使用 API Key

---

## ✅ 推荐配置总结

### 生产环境
- ✅ 只暴露前端端口 80/443
- ✅ 后端完全内部化
- ✅ 使用 Nginx 反向代理

### 开发环境
- ✅ 使用 docker-compose.dev.yml
- ✅ 暴露后端端口便于调试
- ✅ 使用不同端口避免冲突
