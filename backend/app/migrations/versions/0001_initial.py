"""initial schema

初始迁移：依据 ORM 模型（app.models）一次性创建全部 10 张表、索引与约束。
与开发技术文档 / 数据库设计文档 v1.1 对齐。

说明：为保证 schema 与 ORM 模型严格一致（避免手写 DDL 漂移），
此处直接以 Base.metadata 创建；后续增量变更请用
`alembic revision --autogenerate` 生成新迁移文件。

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-26
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op

from app.database import Base

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
