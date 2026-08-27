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
    """提交提前预约菜品，真实落库并限流。

    功能备注：
    - 接口前缀已隐含在 router 上（/api/dish-reservations），本函数处理最末一级 ``POST /``。
    - ``@limiter.limit("5/minute")`` 按请求来源 IP 限流，单 IP 每分钟最多提交 5 次，
      防止恶意刷单；超出时返回 429。
    - 整段逻辑只做“校验 -> 落库 -> 通知”，不返回敏感信息。
    """
    # ① 校验预约门店是否存在（store_id 为外键，但显式校验能给前端更明确的报错）。
    store = db.get(Store, payload.store_id)
    if store is None:
        raise HTTPException(status_code=400, detail="门店不存在")

    # ② 批量校验菜品明细：收集所有 dish_id，一次性查出，避免 N+1 查询。
    dish_ids = [it.dish_id for it in payload.items]
    dishes = {d.id: d for d in db.query(Dish).filter(Dish.id.in_(dish_ids)).all()}
    for it in payload.items:
        if it.dish_id not in dishes:
            raise HTTPException(status_code=400, detail=f"菜品不存在：ID {it.dish_id}")

    # ③ 记录提交者真实 IP（用于风控/审计），client 为 None 时兜底为空串。
    ip_address = request.client.host if request.client else ""

    # ④ 写入预约主表；初始状态统一为 pending（待确认），由后台流转。
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
    db.flush()  # 先 flush 以拿到自增主键 reservation.id，供明细表外键引用

    # ⑤ 写入预约明细表：一条主单对应多条菜品记录（dish_id + quantity）。
    for it in payload.items:
        db.add(
            DishReservationItem(
                reservation_id=reservation.id,
                dish_id=it.dish_id,
                quantity=it.quantity,
                note=it.note,
            )
        )

    # ⑥ 一次性提交事务；提交后刷新对象以读取数据库默认值（如 created_at）。
    db.commit()
    db.refresh(reservation)

    # ⑦ 触发“新预约”通知钩子（邮件/短信等），失败不影响主流程落库。
    send_reservation_notification(reservation)

    # ⑧ 返回统一成功包络，仅暴露预约 id，不回传用户隐私全量字段。
    return ok(
        {"id": reservation.id},
        message="预约提交成功，门店将尽快与您确认。",
    )
