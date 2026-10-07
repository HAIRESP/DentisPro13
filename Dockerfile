# Multi-stage Dockerfile for a standalone DentisPro server
# PlanetOdonto - Sistema Dental Odontológico

FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build Vite frontend & esbuild server
RUN npm run build

# Production image runner
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DENTISPRO_HOST=0.0.0.0
ENV DENTISPRO_DATA_DIR=/data
VOLUME ["/data"]
# Set DENTISPRO_PUBLIC_ORIGIN=https://your-domain when starting this container.

# Copy runtime files from builder
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/tuss_schema.sql ./src/db/tuss_schema.sql
COPY --from=builder /app/server/localAuthStore.ts ./server/localAuthStore.ts
COPY --from=builder /app/scripts/recover-admin.mjs ./scripts/recover-admin.mjs

# Expose the application port behind an HTTPS reverse proxy
EXPOSE 3000

# Run compiled Express server
CMD ["node", "dist/server.cjs"]
