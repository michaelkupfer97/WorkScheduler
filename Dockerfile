# Build from repo root: docker build -f Dockerfile -t workscheduler-api .
FROM node:22-alpine

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY shared /app/shared

# shared/*.ts resolves modules from /app — symlink so `zod` (in backend/node_modules) is found
RUN ln -s /app/backend/node_modules /app/node_modules

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# tsconfig rootDir ".." emits dist/backend/src and dist/shared
CMD ["node", "dist/backend/src/server.js"]
