"""菜品接口。

前缀 /api/dishes：
- GET /dish-categories           分类列表
- GET /                         菜品列表（?category=&is_recommended=&limit=&offset=）
- GET /{slug}                   菜品详情

DishOut 的 category / category_name / price_text 为运行时计算填充。
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dishes import Dish
from app.models.dish_categories import DishCategory
from app.schemas.common import ok
from app.schemas.dish import DishOut

router = APIRouter(tags=["菜品"])


def _price_text(price: int) -> str:
    """分 -> ¥ 文本。4800 -> ¥48；4880 -> ¥48.8。"""
    if price % 100 == 0:
        return f"¥{price // 100}"
    return f"¥{price / 100:.1f}"


def _to_dish_out(dish: Dish) -> DishOut:
    """将 ORM 对象转换为对外响应（填充分类与价格文本）。"""
    category = dish.category
    return DishOut(
        id=dish.id,
        name=dish.name,
        slug=dish.slug,
        category=category.key if category else "",
        category_name=category.name if category else "",
        category_color=category.color if category else "",
        price=dish.price,
        price_text=_price_text(dish.price),
        description=dish.description,
        image_url=dish.image_url,
        tags=dish.tags or [],
        is_recommended=dish.is_recommended,
    )


@router.get("/dish-categories")
def list_categories(db: Session = Depends(get_db)) -> dict:
    """菜品分类列表（按 sort_order 排序）。"""
    cats = db.query(DishCategory).order_by(DishCategory.sort_order).all()
    items = [
        {
            "id": c.id,
            "key": c.key,
            "name": c.name,
            "color": c.color,
            "sort_order": c.sort_order,
        }
        for c in cats
    ]
    return ok(items)


@router.get("")
def list_dishes(
    category: str | None = None,
    is_recommended: bool | None = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> dict:
    """菜品列表，支持按分类键、是否推荐过滤，分页返回 {total, items}。"""
    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    query = db.query(Dish).filter(Dish.is_active == True)  # noqa: E712
    if category:
        cat = db.query(DishCategory).filter(DishCategory.key == category).first()
        if cat is None:
            return ok({"total": 0, "items": []})
        query = query.filter(Dish.category_id == cat.id)
    if is_recommended is not None:
        query = query.filter(Dish.is_recommended == is_recommended)

    query = query.order_by(Dish.sort_order)
    total = query.count()
    rows = query.offset(offset).limit(limit).all()
    items = [_to_dish_out(d) for d in rows]
    return ok({"total": total, "items": items})


@router.get("/{slug}")
def get_dish(slug: str, db: Session = Depends(get_db)) -> dict:
    """菜品详情（仅上架菜品）。"""
    dish = db.query(Dish).filter(Dish.slug == slug, Dish.is_active == True).first()  # noqa: E712
    if dish is None:
        raise HTTPException(status_code=404, detail="菜品不存在")
    return ok(_to_dish_out(dish))
