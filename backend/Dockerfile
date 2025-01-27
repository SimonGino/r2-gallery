# 构建阶段
FROM python:3.9-slim as builder

WORKDIR /app

# 安装PDM
RUN pip install -U pip setuptools wheel
RUN pip install pdm

# 复制项目文件
COPY pyproject.toml pdm.lock ./

# 安装依赖
RUN pdm install --prod --no-lock --no-editable

# 生产阶段
FROM python:3.9-slim

WORKDIR /app

# 创建数据库目录并设置正确的权限
RUN mkdir -p /app && \
    chown -R nobody:nogroup /app && \
    chmod 777 /app

# 复制依赖和源代码
COPY --from=builder /app/.venv/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY src/ ./src/

# 设置环境变量
ENV PYTHONPATH=/app

# 切换到非 root 用户
USER nobody

EXPOSE 8000

# 启动应用
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]