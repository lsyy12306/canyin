"""在线留言表（contact_messages）。"""
from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
    text,
)

from app.database import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(32), nullable=False, comment="称呼")
    contact = Column(String(128), nullable=False, comment="联系方式（手机/邮箱）")
    msg_type = Column(
        String(16),
        nullable=False,
        comment="franchise/job/cooperation/other",
    )
    content = Column(Text, nullable=False, comment="留言内容")
    status = Column(
        String(16),
        default="pending",
        comment="pending/replied/closed",
    )
    ip_address = Column(String(64), default="", comment="提交者 IP")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="提交时间")

    __table_args__ = (
        Index("idx_messages_status", "status"),
        Index("idx_messages_type", "msg_type"),
        Index("idx_messages_created", text("created_at DESC")),
        CheckConstraint(
            "msg_type IN ('franchise', 'job', 'cooperation', 'other')",
            name="ck_contact_msg_type",
        ),
        CheckConstraint(
            "status IN ('pending', 'replied', 'closed')",
            name="ck_messages_status",
        ),
    )
