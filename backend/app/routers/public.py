"""公共接口：健康检查、站点配置读取。

前缀 /api/public：
- GET /health
- GET /configs?group=
- GET /configs/{key}

configs 接口将 config_key / config_value 映射为 key / value 输出。
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.site_configs import SiteConfig
from app.schemas.common import ok
from app.schemas.config import ConfigItem

router = APIRouter(tags=["公共"])


@router.get("/health")
def health() -> dict:
    """健康检查。"""
    return ok({"status": "ok", "service": "weihe-api", "version": "1.0.0"})


@router.get("/configs")
def list_configs(group: str | None = None, db: Session = Depends(get_db)) -> dict:
    """按分组（可选）列出站点配置，映射为 key/value。"""
    query = db.query(SiteConfig)
    if group:
        query = query.filter(SiteConfig.config_group == group)
    items = [
        ConfigItem(
            key=c.config_key,
            value=c.config_value,
            group=c.config_group,
            description=c.description,
        )
        for c in query.order_by(SiteConfig.config_key).all()
    ]
    return ok(items)


@router.get("/configs/{key}")
def get_config(key: str, db: Session = Depends(get_db)) -> dict:
    """获取单个站点配置（按 key）。"""
    config = db.query(SiteConfig).filter(SiteConfig.config_key == key).first()
    if config is None:
        raise HTTPException(status_code=404, detail=f"配置项不存在: {key}")
    return ok(
        ConfigItem(
            key=config.config_key,
            value=config.config_value,
            group=config.config_group,
            description=config.description,
        )
    )
