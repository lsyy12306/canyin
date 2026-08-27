"""通用依赖。

get_db 实际定义在 database.py，这里做再导出，便于统一从 app.deps 引入。
"""
from __future__ import annotations

from app.database import get_db

__all__ = ["get_db"]
