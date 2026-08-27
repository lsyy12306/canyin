"""通用响应包络辅助。

统一响应格式：{"code":200,"message":"success","data":...}
"""
from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


def ok(data: Any = None, message: str = "success") -> dict:
    """成功响应包络。"""
    return {"code": 200, "message": message, "data": data}


def fail(code: int, message: str, data: Any = None) -> dict:
    """错误响应包络。"""
    return {"code": code, "message": message, "data": data}


class ApiResponse(BaseModel):
    """统一响应包络（用于文档/类型提示）。"""

    model_config = ConfigDict(from_attributes=True)

    code: int = 200
    message: str = "success"
    data: Optional[Any] = None
