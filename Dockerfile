FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev -w presight-server && npm cache clean --force
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENV PORT=3000 DB_PATH=/data/app.db STATIC_DIR=/app/client/dist
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
