# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma needs OpenSSL during client generation
RUN apk add --no-cache openssl

# Copy dependency files first
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Generate Prisma client with OpenSSL 3 available
RUN npx prisma generate

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build


# ---- Stage 2: Production ----
FROM node:20-alpine AS runner

# Prisma runtime also needs OpenSSL
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy application files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install production dependencies
RUN npm ci --omit=dev

# Give ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]