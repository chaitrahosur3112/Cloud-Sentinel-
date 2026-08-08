FROM node:20-bookworm-slim

WORKDIR /usr/src/app

# OpenSSL is required by Prisma
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Generate Prisma Client inside the Debian-based container
RUN npx prisma generate

# Build the Express/TypeScript API
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]