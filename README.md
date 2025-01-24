# R2 Gallery

[中文文档](./README.zh-CN.md)

A modern, responsive web application for managing and displaying images stored in Cloudflare R2 storage. Built with React and TypeScript, featuring a beautiful waterfall layout and drag-and-drop upload functionality.

![Markdown Logo](https://images.mytest.cc/20250124133938_26129260f0bfe221329a4aeaa09c7efe.png "Markdown Logo")
## Features

- 🖼️ Beautiful waterfall layout for image display
- 📤 Drag-and-drop image upload
- 🔄 Infinite scroll for smooth browsing
- 📱 Responsive design for all devices
- 🚀 Fast and efficient using Cloudflare R2 storage
- 🎨 Modern UI with Radix UI and Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- AWS SDK (for Cloudflare R2)
- React Router
- React Dropzone

## Prerequisites

- Node.js 16+
- A Cloudflare account with R2 storage enabled
- R2 bucket and access credentials

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/r2-gallery.git
cd r2-gallery
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your Cloudflare R2 credentials:

```env
VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id
VITE_CLOUDFLARE_SECRET_ACCESS_KEY=your_access_key
VITE_BUCKET_NAME=your_bucket_name
VITE_BUCKET_ENDPOINT=your_endpoint_name
```

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Usage

### Browsing Images

- The home page displays all images in a waterfall layout
- Scroll down to load more images automatically
- Click on image actions to:
  - Download the image
  - View the original image
  - Copy the image link
  - Delete the image

### Uploading Images

1. Click the "Upload Image" button
2. Drag and drop images into the upload area or click to select files
3. Supported formats: JPG, JPEG, PNG, GIF, WEBP
4. View upload progress and confirmation

## Docker Support

To run the application using Docker:

```bash
docker build -t r2-gallery .
docker run -p 5173:5173 r2-gallery
```

## License

MIT
