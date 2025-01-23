# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built frontend and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server

# Copy environment variables example file
COPY .env.example .env.example

# Expose API port
EXPOSE 3000

# Start the server
CMD ["node", "-r", "ts-node/register", "src/server/index.ts"]