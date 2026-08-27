"""测试会话级准备：在导入 app 前设置测试数据库。

使用临时 SQLite 文件库，create_all + 种子最简数据（dish_categories / dishes /
site_configs / 默认管理员），保证接口测试可独立运行。
"""
from __future__ import annotations

import os

# 必须在 import app 之前设置，确保 settings 读取到测试库。
os.environ.setdefault("DATABASE_URL", "sqlite:///./.test_weihe.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only")


def pytest_configure(config) -> None:  # noqa: ANN001
    from app.database import Base, engine
    from app import models  # noqa: F401  注册模型

    # 兜底建表。
    Base.metadata.create_all(bind=engine)

    # 写入示例数据（幂等）。
    from seed import seed_all

    seed_all()
