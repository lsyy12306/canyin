"""路由包汇总导出。"""
from __future__ import annotations

from app.routers import admin, contact, dishes, franchise, jobs, news, public, stores

__all__ = [
    "public",
    "dishes",
    "stores",
    "news",
    "jobs",
    "franchise",
    "contact",
    "admin",
]
