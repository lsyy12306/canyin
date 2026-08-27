"""招商接口。

前缀 /api/franchise：
- GET /info        加盟政策与合规信息（来自 site_configs）
- POST /inquiries  提交加盟意向（限流 5/minute/IP，记录 ip_address）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models.franchise_inquiries import FranchiseInquiry
from app.models.site_configs import SiteConfig
from app.schemas.common import ok
from app.schemas.inquiry import FranchiseInfoOut, InquiryCreate
from app.services.email_service import send_inquiry_notification

router = APIRouter(tags=["招商"])

# 加盟页所需配置项键。
_INFO_KEYS = [
    "icp",
    "police_record",
    "franchise_license",
    "franchise_risk_tip",
    "contact_phone",
    "contact_email",
    "contact_address",
]


@router.get("/info")
def franchise_info(db: Session = Depends(get_db)) -> dict:
    """加盟合作页公开信息（备案号、风险提示、联系方式）。"""
    rows = db.query(SiteConfig).filter(SiteConfig.config_key.in_(_INFO_KEYS)).all()
    data = {c.config_key: c.config_value for c in rows}
    info = FranchiseInfoOut(
        icp=data.get("icp", ""),
        police_record=data.get("police_record", ""),
        franchise_license=data.get("franchise_license", ""),
        franchise_risk_tip=data.get("franchise_risk_tip", ""),
        contact_phone=data.get("contact_phone", ""),
        contact_email=data.get("contact_email", ""),
        contact_address=data.get("contact_address", ""),
    )
    return ok(info)


@router.post("/inquiries")
@limiter.limit("5/minute")
def create_inquiry(
    request: Request,
    payload: InquiryCreate,
    db: Session = Depends(get_db),
) -> dict:
    """提交加盟意向，真实落库并限流。"""
    ip_address = request.client.host if request.client else ""
    inquiry = FranchiseInquiry(
        name=payload.name,
        phone=payload.phone,
        city=payload.city or "",
        budget_range=payload.budget_range or "",
        message=payload.message or "",
        ip_address=ip_address,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    send_inquiry_notification(inquiry)

    return ok(
        {"id": inquiry.id},
        message="提交成功，招商顾问将在 1-2 个工作日内与您联系。",
    )
