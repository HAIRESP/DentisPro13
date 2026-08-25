# Multi-stage Dockerfile for Google Cloud Run Deployment
# PlanetOdonto - Sistema Dental Odontológico

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build Vite frontend & esbuild server
RUN npm run build

# Production image runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime files from builder
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Expose port 3000 for Cloud Run
EXPOSE 3000

# Run compiled Express server
CMD ["node", "dist/server.cjs"]
