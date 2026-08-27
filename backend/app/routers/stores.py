"""门店接口。

前缀 /api/stores：
- GET /        门店列表（?city=）
- GET /{slug} 门店详情
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stores import Store
from app.schemas.common import ok
from app.schemas.store import StoreOut

router = APIRouter(tags=["门店"])


@router.get("")
def list_stores(city: str | None = None, db: Session = Depends(get_db)) -> dict:
    """门店列表（默认仅展示 is_active）。"""
    query = db.query(Store).filter(Store.is_active == True)  # noqa: E712
    if city:
        query = query.filter(Store.city == city)
    query = query.order_by(Store.sort_order)
    total = query.count()
    items = [StoreOut.model_validate(s) for s in query.all()]
    return ok({"total": total, "items": items})


@router.get("/{slug}")
def get_store(slug: str, db: Session = Depends(get_db)) -> dict:
    """门店详情。"""
    store = db.query(Store).filter(Store.slug == slug, Store.is_active == True).first()  # noqa: E712
    if store is None:
        raise HTTPException(status_code=404, detail="门店不存在")
    return ok(StoreOut.model_validate(store))
