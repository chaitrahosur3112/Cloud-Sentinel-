# Why these specific steps, in this order: Docker caches each layer.
# Copying package*.json and installing deps BEFORE copying the rest of the
# source means "npm install" is only re-run when dependencies actually
# change, not on every single code edit — much faster rebuilds.

FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
