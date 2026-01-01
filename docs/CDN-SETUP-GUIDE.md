# Cloudflare CDN 缓存配置指南

## 🆓 完全免费！无需付费

Cloudflare CDN 缓存是**完全免费**的，包括在免费计划中。你只需要：
- ✅ Cloudflare 账号（免费）
- ✅ 域名托管在 Cloudflare（免费）
- ✅ R2 存储（免费额度：10GB 存储 + 每月 1000 万次读取）

---

## 📋 配置步骤

### 步骤 1：绑定自定义域名到 R2 Bucket

#### 为什么需要自定义域名？

| 访问方式 | URL 示例 | CDN 缓存 | 成本 |
|---------|---------|---------|------|
| **R2 直连** | `https://pub-xxxxx.r2.dev/image.jpg` | ❌ 无 | 高（每次都读 R2）|
| **自定义域名** | `https://images.yourdomain.com/image.jpg` | ✅ 有 | 低（CDN 缓存）|

#### 操作步骤：

1. **登录 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com
   ```

2. **进入 R2 管理**
   ```
   左侧菜单 > R2 > 选择你的 bucket
   ```

3. **连接自定义域名**
   ```
   点击 "Settings" 标签
   > "Public Access" 区域
   > 点击 "Connect Domain" 按钮
   ```

4. **配置域名**
   ```
   Domain: images.yourdomain.com
   
   ✓ Cloudflare 会自动：
     - 创建 DNS CNAME 记录
     - 启用 CDN 代理（橙色云朵）
     - 配置 SSL/TLS 证书
     - 启用 Gzip/Brotli 压缩
   ```

5. **等待 DNS 生效**
   ```
   通常 1-5 分钟
   验证：访问 https://images.yourdomain.com
   ```

---

### 步骤 2：配置缓存规则

#### 方案 A：Page Rules（免费版 3 条规则）

```
Dashboard > 你的域名 > Rules > Page Rules > Create Page Rule

配置：
┌────────────────────────────────────────────┐
│ URL Pattern: images.yourdomain.com/*      │
│                                            │
│ Settings:                                  │
│ ✓ Cache Level: Cache Everything           │
│ ✓ Edge Cache TTL: 1 month                 │
│ ✓ Browser Cache TTL: 4 hours              │
│                                            │
│ [Save and Deploy]                          │
└────────────────────────────────────────────┘
```

**优点：** 简单直接
**缺点：** 免费版只有 3 条规则

---

#### 方案 B：Cache Rules（推荐，更灵活）

```
Dashboard > 你的域名 > Caching > Cache Rules > Create Rule

配置：
┌────────────────────────────────────────────┐
│ Rule Name: R2 Images CDN Cache            │
│                                            │
│ When incoming requests match:              │
│   Hostname equals images.yourdomain.com    │
│   AND                                      │
│   File extension is one of:                │
│     jpg, jpeg, png, gif, webp, svg        │
│                                            │
│ Then:                                      │
│   ✓ Eligible for cache: Yes                │
│   ✓ Edge Cache TTL: 30 days                │
│   ✓ Browser Cache TTL: 1 day               │
│   ✓ Respect Origin Cache-Control: No      │
│                                            │
│ [Deploy]                                   │
└────────────────────────────────────────────┘
```

**优点：** 更灵活，可以精确控制
**缺点：** 需要付费计划（Pro $20/月）才能使用 Cache Rules

**免费用户建议：** 使用方案 A（Page Rules）

---

### 步骤 3：更新后端配置

修改 `.env` 文件中的 `BUCKET_ENDPOINT`：

```bash
# 编辑 backend/.env
BUCKET_ENDPOINT=images.yourdomain.com

# ❌ 不要使用：
# BUCKET_ENDPOINT=pub-xxxxx.r2.dev
```

修改后，重启后端：
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

---

### 步骤 4：验证 CDN 缓存是否生效

#### 方法 1：查看响应头

```bash
curl -I https://images.yourdomain.com/your-image.jpg

# 查看响应头中的：
CF-Cache-Status: HIT    # 缓存命中（好！）
CF-Cache-Status: MISS   # 缓存未命中（首次请求正常）
CF-Cache-Status: EXPIRED # 缓存过期
```

#### 方法 2：使用浏览器开发者工具

```
1. 打开你的网站
2. F12 打开开发者工具
3. Network 标签
4. 刷新页面，查看图片请求
5. 点击图片请求，查看 Response Headers：

   cf-cache-status: HIT
   cf-ray: 8xxx-SJC
   server: cloudflare
```

#### 方法 3：在线工具

```
https://www.whatsmydns.net/
输入：images.yourdomain.com
查看全球 DNS 解析情况
```

---

## 🚀 性能优化建议

### 1. 启用自动压缩（免费）

```
Dashboard > 你的域名 > Speed > Optimization

✓ Auto Minify: HTML, CSS, JS
✓ Brotli: On
```

### 2. 启用 HTTP/3（免费）

```
Dashboard > 你的域名 > Network

✓ HTTP/3 (with QUIC): On
✓ 0-RTT Connection Resumption: On
```

### 3. 配置合理的缓存时间

```
图片类型            Edge TTL    Browser TTL
─────────────────────────────────────────
头像、Logo           1 year      1 day
产品图片             1 month     4 hours
动态内容图片         1 day       1 hour
临时图片             1 hour      0
```

---

## 💰 成本对比

### 无 CDN（直接访问 R2）

```
假设：每月 100 万次图片请求，平均 500KB/图

R2 读取费用：
- Class A (List): $0
- Class B (Read): $4.50 / 百万次
- 出站流量：免费（R2 到互联网）

月成本：$4.50
```

### 有 CDN（95% 缓存命中率）

```
CDN 费用：$0（免费）

R2 读取费用：
- 只有 5% 的请求到达 R2
- 5 万次 × $4.50 / 百万 = $0.23

月成本：$0.23
```

**节省：95%** 🎉

---

## 🔧 高级配置（可选）

### 1. 根据设备类型返回不同尺寸（需要 Workers）

如果想要根据设备类型（手机/桌面）返回不同尺寸的图片，可以使用 Cloudflare Workers：

```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    
    // 手机端请求小图
    if (isMobile && !url.searchParams.has('size')) {
      url.searchParams.set('size', 'mobile');
    }
    
    return env.ASSETS.fetch(request);
  }
}
```

### 2. 智能缓存刷新

当上传新图片时，自动刷新 CDN 缓存：

```python
# backend/src/api/images.py
import requests

def purge_cdn_cache(url: str):
    """Purge Cloudflare CDN cache for specific URL"""
    cf_api_token = os.getenv('CLOUDFLARE_API_TOKEN')
    zone_id = os.getenv('CLOUDFLARE_ZONE_ID')
    
    response = requests.post(
        f'https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache',
        headers={
            'Authorization': f'Bearer {cf_api_token}',
            'Content-Type': 'application/json'
        },
        json={'files': [url]}
    )
    return response.json()

# 在上传图片后调用
@router.post("/upload")
async def upload_image(...):
    # ... 上传逻辑
    
    # 预热 CDN 缓存
    image_url = f"https://{settings.BUCKET_ENDPOINT}/{file_name}"
    requests.get(image_url)  # 触发一次请求，让 CDN 缓存
    
    return ImageObject(...)
```

---

## ❓ 常见问题

### Q1: 我没有域名怎么办？

**A:** 可以使用 Cloudflare 提供的免费二级域名服务（Workers.dev），但功能有限。建议购买域名（约 $10/年）。

### Q2: 修改了图片，CDN 还是返回旧图？

**A:** 有两种解决方案：
1. **手动清除缓存**：Dashboard > Caching > Purge Cache
2. **版本化 URL**：上传时文件名包含时间戳（当前代码已实现）

### Q3: 缓存命中率低怎么办？

**A:** 检查以下几点：
- ✓ 确认 DNS 记录是橙色云朵（代理模式）
- ✓ 确认 Page Rule 或 Cache Rule 已启用
- ✓ 确认 URL 没有变化（如查询参数）
- ✓ 等待一段时间让缓存预热

### Q4: 免费版够用吗？

**A:** 对于中小型项目完全够用：
- ✓ 无限带宽
- ✓ 无限请求数
- ✓ 全球 CDN 节点
- ❌ 限制：每个域名 3 条 Page Rules

---

## 📊 监控和分析

### 查看缓存统计

```
Dashboard > 你的域名 > Analytics > Traffic

可以看到：
- 总请求数
- 缓存命中率
- 带宽节省
- 响应时间分布
```

### 推荐的监控指标

```
指标                 目标值
─────────────────────────────
缓存命中率           > 90%
平均响应时间         < 100ms
P95 响应时间         < 300ms
错误率               < 0.1%
```

---

## 🎯 总结

### 配置清单

- [ ] R2 bucket 绑定自定义域名
- [ ] 配置 Page Rule 或 Cache Rule
- [ ] 修改 `.env` 中的 `BUCKET_ENDPOINT`
- [ ] 重启后端服务
- [ ] 验证 CDN 缓存生效（`cf-cache-status: HIT`）
- [ ] 监控缓存命中率

### 预期效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 响应时间 | 500-1000ms | 50-100ms |
| 成本 | $4.50/月 | $0.23/月 |
| 可用性 | 99% | 99.99% |
| 全球访问速度 | 慢（单点） | 快（全球节点）|

---

需要帮助配置或遇到问题，随时告诉我！
