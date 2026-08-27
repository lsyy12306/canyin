# =============================================================================
# 味禾小馆官网 —— 前台 (React + Vite + Tailwind) 生产镜像
# -----------------------------------------------------------------------------
# 功能说明（多阶段构建，最终镜像极小）：
#   阶段一 build：用 node:20-alpine 安装依赖并执行 npm run build 产出 dist/；
#   阶段二 run ：用 nginx:alpine 托管静态产物，并反向代理 /api、/uploads 到后端。
# 这样浏览器只需访问前台 80 端口，API 请求由本容器内的 nginx 转发到 backend:8000，
# 无需在浏览器端跨域直连后端端口。
# =============================================================================

# ---------- 阶段一：构建 ----------
FROM node:20-alpine AS build
WORKDIR /app

# 优先复制锁文件，利用缓存
COPY package*.json ./
RUN npm ci

# 复制源码并构建（构建产物在 /app/dist）
COPY . .
RUN npm run build

# ---------- 阶段二：运行（nginx 托管静态 + 反代）----------
FROM nginx:alpine

# 用自定义 nginx 配置覆盖默认配置（见 frontend/nginx.conf）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段拷贝打包产物到 nginx 默认站点目录
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx 前台运行，便于容器管理其生命周期与日志
CMD ["nginx", "-g", "daemon off;"]
