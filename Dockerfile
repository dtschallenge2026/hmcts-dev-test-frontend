FROM node:18 AS builder
WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
RUN corepack enable && yarn install --immutable
COPY . .
RUN yarn build

FROM node:18-slim
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/tsconfig.json ./
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
USER appuser
EXPOSE 3100
ENV NODE_ENV=production
CMD ["node_modules/.bin/ts-node", "-r", "tsconfig-paths/register", "src/main/server.ts"]
