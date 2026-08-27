"""提前预约菜品 - 公共提交接口。

前缀 /api/dish-reservations：
- POST /   提交预约（限流 5/minute/IP，记录 ip_address，含菜品明细）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models.dish_reservation_items import DishReservationItem
from app.models.dish_reservations import DishReservation
from app.models.dishes import Dish
from app.models.stores import Store
from app.schemas.common import ok
from app.schemas.reservation import DishReservationCreate
from app.services.email_service import send_reservation_notification

router = APIRouter(tags=["提前预约菜品"])


@router.post("")
@limiter.limit("5/minute")
def create_reservation(
    request: Request,
    payload: DishReservationCreate,
    db: Session = Depends(get_db),
) -> dict:
    """提交提前预约菜品，真实落库并限流。"""
    store = db.get(Store, payload.store_id)
    if store is None:
        raise HTTPException(status_code=400, detail="门店不存在")

    dish_ids = [it.dish_id for it in payload.items]
    dishes = {d.id: d for d in db.query(Dish).filter(Dish.id.in_(dish_ids)).all()}
    for it in payload.items:
        if it.dish_id not in dishes:
            raise HTTPException(status_code=400, detail=f"菜品不存在：ID {it.dish_id}")

    ip_address = request.client.host if request.client else ""
    reservation = DishReservation(
        store_id=payload.store_id,
        name=payload.name,
        phone=payload.phone,
        reserve_date=payload.reserve_date,
        reserve_time=payload.reserve_time,
        guests=payload.guests,
        note=payload.note,
        status="pending",
        ip_address=ip_address,
    )
    db.add(reservation)
    db.flush()
    for it in payload.items:
        db.add(
            DishReservationItem(
                reservation_id=reservation.id,
                dish_id=it.dish_id,
                quantity=it.quantity,
                note=it.note,
            )
        )
    db.commit()
    db.refresh(reservation)

    send_reservation_notification(reservation)

    return ok(
        {"id": reservation.id},
        message="预约提交成功，门店将尽快与您确认。",
    )
