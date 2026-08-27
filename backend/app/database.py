"""数据库引擎与会话（同步风格，兼容 SQLite / PostgreSQL）。

使用同步 create_engine，便于本地零依赖运行；生产填 PostgreSQL 连接串即可。
字段/类型兼容两方言：tags 用 JSON().with_variant(JSONB(), "postgresql")；
主键用 Integer 自增（PostgreSQL 下等价于 SERIAL，由 SQLAlchemy 隐式序列实现）。
"""
from __future__ import annotations

from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# SQLite 需要关闭单连接线程检查，PostgreSQL 不需要。
_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)


class Base(DeclarativeBase):
    """所有 ORM 模型的声明基类。"""


def get_db() -> Iterator[Session]:
    """FastAPI 依赖：每个请求一个会话，结束后关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
