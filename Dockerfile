# ============================================
# 小雷没摸鱼 Agent — Dockerfile
# 多阶段构建：deps → builder → runner
# ============================================

# ---- Stage 1: deps ----
FROM node:18-alpine AS deps

# better-sqlite3 需要 python/make/g++ 编译
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: builder ----
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建时环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ---- Stage 3: runner ----
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 setup 脚本所需文件
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# 创建持久化目录
RUN mkdir -p /app/data /app/public/uploads/image /app/public/uploads/video /app/public/uploads/document && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

# 持久卷
VOLUME ["/app/data", "/app/public/uploads"]

USER nextjs

EXPOSE 3000

# 启动前先执行 setup 初始化数据库
CMD ["sh", "-c", "npx tsx scripts/setup.ts && node server.js"]
