"""提前预约菜品 - 预约明细（dish_reservation_items）。

一条预约包含多道菜及其数量，关联 dish_reservations（级联删除）。
"""
from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Index, Integer, String, Text, func

from app.database import Base


class DishReservationItem(Base):
    __tablename__ = "dish_reservation_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reservation_id = Column(
        Integer,
        ForeignKey("dish_reservations.id", ondelete="CASCADE"),
        nullable=False,
        comment="所属预约",
    )
    dish_id = Column(
        Integer,
        ForeignKey("dishes.id", ondelete="RESTRICT"),
        nullable=False,
        comment="菜品",
    )
    quantity = Column(Integer, default=1, comment="数量")
    note = Column(String(255), default="", comment="单品备注")

    __table_args__ = (
        Index("idx_dish_reservation_items_res", "reservation_id"),
        Index("idx_dish_reservation_items_dish", "dish_id"),
    )
