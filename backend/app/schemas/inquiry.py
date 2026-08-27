"""加盟意向 Schema。

InquiryCreate 只含必要字段（name/phone 必填，city/budget_range/message 可选）。
FranchiseInfoOut 汇总加盟页所需的合规与联系信息（来自 site_configs）。
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

_InqStatus = Literal["pending", "contacted", "closed"]
_PHONE_RE = r"^1[3-9]\d{9}$"


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)
    phone: str = Field(..., pattern=_PHONE_RE, description="手机号")
    city: str = Field("", max_length=32)
    budget_range: str = Field("", max_length=32)
    message: str = ""


class InquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    city: str = ""
    budget_range: str = ""
    message: str = ""
    status: _InqStatus = "pending"
    ip_address: str = ""
    created_at: Optional[datetime] = None


class FranchiseInfoOut(BaseModel):
    """加盟合作页公开信息（合规与联系方式）。"""

    icp: str = ""
    police_record: str = ""
    franchise_license: str = ""
    franchise_risk_tip: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    contact_address: str = ""
