"""新闻接口。

前缀 /api/news：
- GET /         新闻列表（?type=corporate|industry，仅返回 is_published=True）
- GET /{slug}   新闻详情（仅已发布）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.news import News
from app.schemas.common import ok
from app.schemas.news import NewsOut

router = APIRouter(tags=["新闻"])


@router.get("")
def list_news(
    type: str | None = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> dict:
    """新闻列表，仅返回已发布项；可按 type 过滤，按发布日期倒序。"""
    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    query = db.query(News).filter(News.is_published == True)  # noqa: E712
    if type:
        if type not in ("corporate", "industry"):
            raise HTTPException(status_code=400, detail="type 仅支持 corporate/industry")
        query = query.filter(News.type == type)
    query = query.order_by(News.published_at.desc())
    total = query.count()
    items = [NewsOut.model_validate(n) for n in query.offset(offset).limit(limit).all()]
    return ok({"total": total, "items": items})


@router.get("/{slug}")
def get_news(slug: str, db: Session = Depends(get_db)) -> dict:
    """新闻详情（仅已发布）。"""
    news = db.query(News).filter(News.slug == slug, News.is_published == True).first()  # noqa: E712
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")
    return ok(NewsOut.model_validate(news))
