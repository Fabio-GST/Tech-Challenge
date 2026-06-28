# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

# --- Dependências (todas) ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build (compila TypeScript para ./build) ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ace build

# --- Imagem de produção ---
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/build ./
RUN npm ci --omit=dev
EXPOSE 3333
CMD ["node", "bin/server.js"]
