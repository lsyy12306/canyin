"""FastAPI 应用入口。

- 创建应用、配置 CORS、挂载静态目录。
- 注册 slowapi 限流与统一响应异常处理（HTTP 异常、校验失败、限流）。
- 注册各业务路由（前缀同开发技术文档 §9.1）。
- 启动兜底：Base.metadata.create_all（生产正式用 alembic）；若 users 表为空则创建默认管理员。
"""
from __future__ import annotations

import logging
import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.models import User  # noqa: F401  确保模型注册
from app.routers import (
    admin,
    contact,
    dish_reservations,
    dishes,
    franchise,
    jobs,
    news,
    public,
    stores,
)
from app.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("weihe")

app = FastAPI(title="味禾小馆官网 API", version="1.0.0")

# --------------------------------------------------------------------------- #
# 限流（装饰器模式：app.state.limiter + 异常处理器）
# --------------------------------------------------------------------------- #
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"code": 429, "message": "请求过于频繁，请稍后再试", "data": None},
    )


# --------------------------------------------------------------------------- #
# CORS
# --------------------------------------------------------------------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# 统一响应异常处理
# --------------------------------------------------------------------------- #
@app.exception_handler(StarletteHTTPException)
async def _http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": str(exc.detail), "data": None},
    )


@app.exception_handler(RequestValidationError)
async def _validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"code": 422, "message": "请求参数校验失败", "data": exc.errors()},
    )


@app.exception_handler(Exception)
async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("未处理的服务器异常: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器内部错误", "data": None},
    )


# --------------------------------------------------------------------------- #
# 路由注册（前缀同开发技术文档 §9.1）
# --------------------------------------------------------------------------- #
app.include_router(public.router, prefix="/api/public", tags=["公共"])
app.include_router(dishes.router, prefix="/api/dishes", tags=["菜品"])
app.include_router(stores.router, prefix="/api/stores", tags=["门店"])
app.include_router(news.router, prefix="/api/news", tags=["新闻"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["招聘"])
app.include_router(franchise.router, prefix="/api/franchise", tags=["招商"])
app.include_router(contact.router, prefix="/api/contact", tags=["联系"])
app.include_router(dish_reservations.router, prefix="/api/dish-reservations", tags=["提前预约菜品"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理后台"])


# --------------------------------------------------------------------------- #
# 静态资源挂载
# --------------------------------------------------------------------------- #
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("app/static", exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# --------------------------------------------------------------------------- #
# 启动兜底
# --------------------------------------------------------------------------- #
def _ensure_default_admin() -> None:
    """若 users 表为空，创建默认管理员（来自配置）。"""
    from sqlalchemy.orm import sessionmaker

    Session = sessionmaker(bind=engine)
    with Session() as db:
        if db.query(User).count() > 0:
            return
        user = User(
            username=settings.DEFAULT_ADMIN_USER,
            hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.commit()
        logger.info(
            "已创建默认管理员账号 [%s]，请尽快在线上修改密码。",
            settings.DEFAULT_ADMIN_USER,
        )


@app.on_event("startup")
def _on_startup() -> None:
    # 兜底建表（生产环境以 alembic 迁移为准）。
    Base.metadata.create_all(bind=engine)
    # 兜底迁移：为存量数据库补上新增列（create_all 不会给已存在表加列）。
    _auto_migrate()
    _ensure_default_admin()


def _auto_migrate() -> None:
    """开发期轻量迁移：为已有表补缺失列，避免老库启动即报错。

    仅用于本地 SQLite 快速演进；生产环境请使用 alembic。
    """
    from sqlalchemy import text

    migrations = [
        "ALTER TABLE dish_categories ADD COLUMN color VARCHAR(16) DEFAULT '#C8452E'",
    ]
    with engine.begin() as conn:
        for ddl in migrations:
            try:
                conn.execute(text(ddl))
            except Exception:
                # 列已存在或方言不支持时忽略（幂等）。
                pass
