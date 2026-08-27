"""岗位 Schema（不含简历投递，简历见 application.py）。"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

JobType = Literal["full_time", "part_time", "intern"]


class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=64)
    department: str = ""
    location: str = ""
    type: JobType = "full_time"
    description: str = ""
    requirements: str = ""
    sort_order: int = 0
    is_active: bool = True


class JobCreate(JobBase):
    """管理后台创建岗位。"""


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=64)
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[JobType] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    department: str = ""
    location: str = ""
    type: JobType = "full_time"
    description: str = ""
    requirements: str = ""
    sort_order: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None
