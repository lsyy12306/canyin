"""汇总导出所有 Pydantic Schema。"""
from __future__ import annotations

from app.schemas.common import ApiResponse
from app.schemas.config import ConfigItem, ConfigOut, ConfigValueUpdate
from app.schemas.dish import DishCreate, DishOut, DishUpdate
from app.schemas.store import StoreCreate, StoreOut, StoreUpdate
from app.schemas.news import NewsCreate, NewsOut, NewsUpdate
from app.schemas.job import JobCreate, JobOut, JobUpdate
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.schemas.inquiry import FranchiseInfoOut, InquiryCreate, InquiryOut
from app.schemas.contact import ContactMessageCreate, ContactMessageOut
from app.schemas.auth import LoginRequest, StatusUpdate, TokenResponse

__all__ = [
    "ApiResponse",
    "ConfigItem",
    "ConfigOut",
    "ConfigValueUpdate",
    "DishCreate",
    "DishOut",
    "DishUpdate",
    "StoreCreate",
    "StoreOut",
    "StoreUpdate",
    "NewsCreate",
    "NewsOut",
    "NewsUpdate",
    "JobCreate",
    "JobOut",
    "JobUpdate",
    "ApplicationCreate",
    "ApplicationOut",
    "FranchiseInfoOut",
    "InquiryCreate",
    "InquiryOut",
    "ContactMessageCreate",
    "ContactMessageOut",
    "LoginRequest",
    "StatusUpdate",
    "TokenResponse",
]
