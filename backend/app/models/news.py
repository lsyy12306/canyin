"""新闻表（news）。

type: corporate 企业新闻 / industry 行业资讯。
published_at 为发布日期（手动设置），is_published 控制是否对外展示。
"""
from __future__ import annotations

from datetime import date

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    Date,
    func,
    text,
)

from app.database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(16), nullable=False, comment="corporate/industry")
    title = Column(String(128), nullable=False, comment="标题")
    slug = Column(String(128), unique=True, nullable=False, index=True, comment="URL 标识")
    summary = Column(String(255), default="", comment="摘要")
    content = Column(Text, default="", comment="正文（Markdown 或 HTML）")
    cover_image = Column(String(512), default="", comment="封面图 URL")
    published_at = Column(Date, comment="发布日期")
    is_published = Column(Boolean, default=False, comment="是否发布")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间",
    )

    __table_args__ = (
        Index("idx_news_type_published", "type", "is_published", text("published_at DESC")),
        Index("idx_news_published", "is_published", text("published_at DESC")),
        CheckConstraint(
            "type IN ('corporate', 'industry')",
            name="ck_news_type",
        ),
    )
