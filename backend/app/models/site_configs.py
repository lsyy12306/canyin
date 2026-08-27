"""站点配置表（site_configs）。

承载备案号、联系方式、隐私政策等站点级配置与合规文案。
接口层将 config_key / config_value 映射为 key / value 输出。
"""
from __future__ import annotations

from sqlalchemy import (
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
)

from app.database import Base


class SiteConfig(Base):
    __tablename__ = "site_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    config_key = Column(String(64), unique=True, nullable=False, comment="配置键")
    config_value = Column(Text, default="", comment="配置值")
    config_group = Column(String(32), default="general", comment="分组")
    description = Column(String(255), default="", comment="配置说明")
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="更新时间")

    __table_args__ = (
        Index("idx_site_configs_group", "config_group"),
    )
