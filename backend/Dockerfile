# =============================================================================
# 味禾小馆官网 —— 后端 (FastAPI) 生产镜像
# -----------------------------------------------------------------------------
# 功能说明：
#   1. 基于 python:3.11-slim 构建轻量生产镜像；
#   2. 安装 requirements.txt 中的全部依赖（含 PostgreSQL 同步驱动 psycopg）；
#   3. 以 uvicorn 多进程模式运行 ASGI 应用（--workers 提升并发）；
#   4. 内置 HEALTHCHECK，用公开健康检查接口 /api/public/health 探活；
#   5. 菜品上传目录 app/static/uploads 通过数据卷挂载，保证容器重启不丢图。
#
# 注意（与代码驱动一致）：
#   本项目 ORM 使用【同步】create_engine + SessionLocal（见 app/database.py），
#   因此生产 PostgreSQL 连接串必须用【同步】驱动 postgresql+psycopg://...，
#   不能用 postgresql+asyncpg://...（异步驱动会与同步引擎冲突）。
# =============================================================================

# ---- 基础镜像 ----
FROM python:3.11-slim

# ---- 环境变量（容器运行时行为）----
# 关闭 Python 写 .pyc 缓存、关闭缓冲，保证日志实时可见
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    # 应用工作目录
    APP_HOME=/app

WORKDIR ${APP_HOME}

# ---- 系统依赖 ----
# curl 用于 HEALTHCHECK 探活；libpq5 是 psycopg 连接 PostgreSQL 的运行库
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl libpq5 \
    && rm -rf /var/lib/apt/lists/*

# ---- 先装依赖（利用 Docker 层缓存，只有 requirements.txt 变化才重装）----
COPY requirements.txt ${APP_HOME}/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ---- 复制应用源码（排除 .dockerignore 中声明的无关文件）----
COPY . ${APP_HOME}

# 后端默认监听 8000（docker-compose 内部通信端口）
EXPOSE 8000

# ---- 容器健康检查 ----
# 每 30s 探一次，超时 5s，连续 3 次失败则标记为 unhealthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/api/public/health || exit 1

# ---- 启动命令 ----
# --host 0.0.0.0 允许容器外访问；--workers 4 起 4 个工作进程承担并发。
# 生产也可用 gunicorn -k uvicorn.workers.UvicornWorker，但为不引入未声明依赖，
# 这里统一用 uvicorn。DATABASE_URL 等由 docker-compose / .env 注入。
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"]
