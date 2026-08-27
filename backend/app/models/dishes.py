"""菜品表（dishes）。

价格以“分”为单位整数存储（如 ¥48 -> 4800），避免浮点误差。
tags 用 JSON，PostgreSQL 下为 JSONB，本地回退 JSON。
"""
from __future__ import annotations

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    Integer,
    String,
    TIMESTAMP,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class Dish(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), nullable=False, comment="菜名")
    slug = Column(String(64), unique=True, nullable=False, index=True, comment="URL 标识")
    category_id = Column(
        Integer,
        ForeignKey("dish_categories.id", ondelete="RESTRICT"),
        nullable=False,
        comment="所属分类",
    )
    price = Column(Integer, nullable=False, comment="价格，单位：分")
    description = Column(String(255), default="", comment="菜品简介")
    image_url = Column(String(512), default="", comment="菜品图片 URL")
    tags = Column(JSON().with_variant(JSONB(), "postgresql"), default=list, comment="标签数组")
    is_recommended = Column(Boolean, default=False, comment="是否首页推荐")
    sort_order = Column(Integer, default=0, comment="排序权重")
    is_active = Column(Boolean, default=True, comment="是否上架展示")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间",
    )

    category = relationship("DishCategory", back_populates="dishes")

    __table_args__ = (
        Index("idx_dishes_category", "category_id"),
        Index("idx_dishes_active_sort", "is_active", "sort_order"),
        Index("idx_dishes_recommended", "is_recommended", "is_active"),
        CheckConstraint("price >= 0", name="ck_dishes_price"),
    )
