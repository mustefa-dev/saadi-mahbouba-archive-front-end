# Multi-stage Dockerfile for Nuxt.js application

# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy built application from builder
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/public /app/public

# Switch to non-root user
USER nuxtjs

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
