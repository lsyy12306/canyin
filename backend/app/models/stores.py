"""门店表（stores）。"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    UniqueConstraint,
    func,
)

from app.database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String(32), nullable=False, comment="城市")
    name = Column(String(64), nullable=False, comment="门店名")
    slug = Column(String(64), unique=True, nullable=False, index=True, comment="URL 标识")
    highlight = Column(String(255), default="", comment="一句话亮点")
    image_url = Column(String(512), default="", comment="门店实景图")
    sort_order = Column(Integer, default=0, comment="排序权重")
    is_active = Column(Boolean, default=True, comment="是否展示")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")

    __table_args__ = (
        UniqueConstraint("city", "name", name="uq_stores_city_name"),
        Index("idx_stores_active_sort", "is_active", "sort_order"),
        Index("idx_stores_city", "city"),
    )
