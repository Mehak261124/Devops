FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY server/package*.json ./
RUN npm ci

COPY server/ ./

ENV DATABASE_URL=file:./dev.db
RUN npx prisma generate && \
    npx prisma db push && \
    npm run prisma:seed

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

ENV NODE_ENV=production
ENV PORT=5001
ENV DATABASE_URL=file:./dev.db

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma/dev.db ./dev.db

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "src/index.js"]
