"""提前预约菜品 - 预约主表（dish_reservations）。

顾客在官网选择门店、日期、时间、人数并勾选菜品及数量，提交后落库；
后台可查看并流转状态（pending/confirmed/done/cancelled）。
"""
from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
    text,
)

from app.database import Base


class DishReservation(Base):
    __tablename__ = "dish_reservations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(
        Integer,
        ForeignKey("stores.id", ondelete="RESTRICT"),
        nullable=False,
        comment="预约门店",
    )
    name = Column(String(32), nullable=False, comment="联系人姓名")
    phone = Column(String(16), nullable=False, comment="联系手机")
    reserve_date = Column(String(10), nullable=False, comment="预约日期 YYYY-MM-DD")
    reserve_time = Column(String(8), default="", comment="预约时间 HH:MM")
    guests = Column(Integer, default=1, comment="用餐人数")
    note = Column(Text, default="", comment="备注")
    status = Column(String(16), default="pending", comment="pending/confirmed/done/cancelled")
    ip_address = Column(String(64), default="", comment="提交者 IP")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="提交时间")

    __table_args__ = (
        Index("idx_dish_reservations_status", "status"),
        Index("idx_dish_reservations_store", "store_id"),
        Index("idx_dish_reservations_created", text("created_at DESC")),
        CheckConstraint(
            "status IN ('pending', 'confirmed', 'done', 'cancelled')",
            name="ck_dish_reservations_status",
        ),
    )
