# Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Install PDM
RUN pip install -U pip setuptools wheel && \
    pip install pdm

# Copy project files
COPY pyproject.toml pdm.lock* ./
COPY src/ ./src/

# Install dependencies (production only)
RUN pdm install --prod --no-lock --no-editable

# Production stage
FROM python:3.9-slim

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/.venv /app/.venv

# Copy source code
COPY src/ ./src/

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

# Create database file with proper permissions
RUN touch /app/images.db && \
    chmod 666 /app/images.db && \
    chmod 777 /app

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/images/list?page=1&page_size=1')" || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
