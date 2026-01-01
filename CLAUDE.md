# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

R2 Gallery is a full-stack web application for managing and browsing images stored in Cloudflare R2 storage. It consists of a FastAPI backend (Python) and a React frontend (TypeScript).

## Architecture

### Backend (FastAPI + SQLite)
- **Entry point**: `backend/src/main.py` - FastAPI app with CORS middleware
- **Core modules**:
  - `core/storage.py` - R2 client initialization using boto3
  - `core/sync.py` - Background sync task that synchronizes R2 storage with local SQLite database
  - `core/config.py` - Pydantic settings management for R2 credentials
- **Data layer**:
  - `models/database.py` - SQLAlchemy Image model with fields: key, size, last_modified, url
  - Uses SQLite (`images.db`) as metadata store
- **API**: `api/images.py` - Image CRUD operations, upload with MD5-based naming, sync endpoint

**Key workflow**: On startup, a background task syncs R2 bucket contents to SQLite. Images are stored with format `{timestamp}_{md5hash}.ext`.

### Frontend (React + TypeScript + Vite)
- **Routing**: React Router with two pages - BrowsePage (/) and UploadPage (/upload)
- **UI**: Tailwind CSS + Radix UI components
- **API layer**: `utils/api.ts` - Fetch-based API client for list, upload, sync, delete, download
- **State**: Component-level state with React hooks, infinite scroll pagination

**Key workflow**: Frontend proxies API requests to backend (dev: port 8000), displays images in masonry grid with infinite scroll.

## Development Commands

### Backend
```bash
cd backend

# Using uv (recommended, requires Python 3.9)
uv venv --python 3.9
source .venv/bin/activate  # macOS/Linux, or .venv\Scripts\activate on Windows
uv pip install -e .
uvicorn src.main:app --reload --port 8000

# Using PDM (alternative)
pip install pdm
pdm install
pdm run start  # Runs uvicorn with auto-reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Start dev server (port 5173)
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Production (Docker Compose)
```bash
# Pull images from GitHub Container Registry
docker-compose pull

# Configure .env in project root with R2 credentials:
# CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ACCESS_KEY_ID, 
# CLOUDFLARE_SECRET_ACCESS_KEY, BUCKET_NAME, BUCKET_ENDPOINT

# Start containers
docker-compose up -d
```

## Configuration

Backend requires `.env` file in `backend/` directory (copy from `.env.example`):
- Cloudflare R2 credentials (account ID, access keys)
- Bucket name and endpoint
- Database path defaults to `./images.db`

Frontend dev server proxies `/api/*` requests to `http://localhost:8000`.

## Key Technical Details

1. **Image Upload Flow**: 
   - File validation (image MIME type, extensions: jpg/jpeg/png/gif/webp)
   - MD5 hash generation for deduplication
   - Filename format: `{timestamp}_{md5}.ext`
   - Original image uploaded to R2
   - Metadata saved to SQLite

2. **Sync Mechanism**:
   - Runs automatically on backend startup
   - Can be triggered manually via `POST /api/images/sync`
   - Compares R2 bucket contents with SQLite, adds new images, removes deleted ones

3. **Database Schema**:
   - Single `images` table with indexed `key` and `last_modified` columns
   - SQLAlchemy ORM with declarative base
   - Auto-creates tables on startup

4. **Pagination**:
   - Backend supports `page` (1-indexed) and `page_size` (1-50) query params
   - Returns `has_more` flag for infinite scroll
   - Default page size: 20 items
   - Frontend requests 20 images per page for optimal loading performance

## Common Patterns

- Backend uses dependency injection via FastAPI's `Depends()` for database sessions
- All API errors return HTTPException with appropriate status codes
- Frontend uses async/await for all API calls
- Infinite scroll triggers new page load 300px before reaching bottom for smooth user experience
