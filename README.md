# R2 Gallery
[中文文档](./README.zh-CN.md)

A modern web application for managing and browsing images stored in Cloudflare R2 storage.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- AWS SDK (for Cloudflare R2)
- React Router
- React Dropzone
- FastAPI (Backend)
- SQLite
- Docker & Docker Compose

## Prerequisites

- Node.js 20+
- Python 3.9+
- Docker and Docker Compose (for production deployment)
- Cloudflare R2 Storage Account

## Development Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the environment template and configure your R2 credentials:
```bash
cp .env.example .env
```

3. Install dependencies using PDM:
```bash
pip install pdm
pdm install
```

4. Start the development server:
```bash
pdm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Production Deployment

1. Configure your environment variables in `.env` file

2. Build and start the containers:
```bash
docker-compose up -d --build
```

The application will be available at http://localhost:80

## Features

- Image upload with automatic thumbnail generation
- Image gallery with infinite scroll
- Image preview and download
- Responsive design
- Automatic synchronization with R2 storage
- Gzip compression for better performance
- Docker support for easy deployment

## Environment Variables

### Backend

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_ACCESS_KEY_ID`: R2 access key ID
- `CLOUDFLARE_SECRET_ACCESS_KEY`: R2 secret access key
- `BUCKET_NAME`: R2 bucket name
- `BUCKET_ENDPOINT`: R2 bucket endpoint

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
