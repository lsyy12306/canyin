"""提前预约菜品 Schema。

- DishReservationCreate：顾客提交（含菜品明细列表）。
- DishReservationOut / ReservationItemOut：对外响应（含门店名、菜名、明细）。
- 状态流转复用 auth.StatusUpdate（status 字段）。
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ReservationItemIn(BaseModel):
    """预约中的单品（菜品 + 数量）。"""

    dish_id: int = Field(..., gt=0, description="菜品 ID")
    quantity: int = Field(1, ge=1, le=99, description="数量")
    note: str = ""


class DishReservationCreate(BaseModel):
    """顾客提交预约。"""

    store_id: int = Field(..., gt=0, description="门店 ID")
    name: str = Field(..., min_length=1, max_length=32, description="联系人")
    phone: str = Field(..., min_length=5, max_length=16, description="手机号")
    reserve_date: str = Field(..., min_length=10, max_length=10, description="预约日期 YYYY-MM-DD")
    reserve_time: str = Field("", max_length=8, description="预约时间 HH:MM")
    guests: int = Field(1, ge=1, le=50, description="用餐人数")
    note: str = Field("", max_length=500, description="备注")
    items: List[ReservationItemIn] = Field(..., min_length=1, description="预约菜品明细")


class ReservationItemOut(BaseModel):
    """预约明细对外响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    dish_id: int
    quantity: int
    note: str = ""
    dish_name: str = ""


class DishReservationOut(BaseModel):
    """预约对外响应（含门店名与明细）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    store_name: str = ""
    name: str
    phone: str
    reserve_date: str
    reserve_time: str = ""
    guests: int = 1
    note: str = ""
    status: str = "pending"
    ip_address: str = ""
    created_at: Optional[str] = None
    items: List[ReservationItemOut] = []
