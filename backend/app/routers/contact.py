"""联系接口。

前缀 /api/contact：
- POST /messages  提交在线留言（限流 5/minute/IP，记录 ip_address）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models.contact_messages import ContactMessage
from app.schemas.common import ok
from app.schemas.contact import ContactMessageCreate
from app.services.email_service import send_contact_notification

router = APIRouter(tags=["联系"])


@router.post("/messages")
@limiter.limit("5/minute")
def create_message(
    request: Request,
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
) -> dict:
    """提交在线留言，真实落库并限流。"""
    ip_address = request.client.host if request.client else ""
    message = ContactMessage(
        name=payload.name,
        contact=payload.contact,
        msg_type=payload.msg_type,
        content=payload.content,
        ip_address=ip_address,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    send_contact_notification(message)

    return ok({"id": message.id}, message="留言已收到，我们会尽快回复。")
