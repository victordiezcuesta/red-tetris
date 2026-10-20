# ---------- Fase 1: compilar el cliente (con el bonus encima) ----------
FROM node:lts-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
COPY bonus/client/ ./
RUN npm run build

# ---------- Fase 2: compilar el servidor ----------
FROM node:lts-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ---------- Fase 3: imagen final ----------
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist /app/client/dist
EXPOSE 3000
CMD ["npm", "start"]