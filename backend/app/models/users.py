"""管理后台用户表（users）。

JWT 鉴权使用：hashed_password 为 bcrypt 哈希；role 区分 admin / editor。
"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    func,
)

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(32), unique=True, nullable=False, index=True, comment="用户名")
    hashed_password = Column(String(255), nullable=False, comment="bcrypt 密码哈希")
    role = Column(String(16), default="editor", comment="admin/editor")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'editor')", name="ck_users_role"),
    )
