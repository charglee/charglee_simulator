FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite app
RUN npm run build

# Production server
FROM node:22-alpine

WORKDIR /app

# Install simple http server
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]
