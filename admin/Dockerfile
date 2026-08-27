# =============================================================================
# 味禾小馆官网 —— 后台管理系统 (React + Vite + Ant Design) 生产镜像
# -----------------------------------------------------------------------------
# 与前台同构的多阶段构建：
#   阶段一 build：node:20-alpine 安装依赖并 npm run build 产出 dist/；
#   阶段二 run ：nginx:alpine 托管静态，并反向代理 /api、/uploads 到后端。
# 后台在 docker-compose 中发布到 8080 端口（前台占 80），互不冲突。
# =============================================================================

# ---------- 阶段一：构建 ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- 阶段二：运行 ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
