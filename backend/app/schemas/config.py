"""站点配置 Schema。

ConfigItem：对外接口映射后的 {key, value, group, description}。
ConfigOut：管理后台完整字段。
ConfigValueUpdate：更新配置值的请求体。
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConfigItem(BaseModel):
    """公共接口返回的配置项（config_key/config_value 映射为 key/value）。"""

    key: str
    value: str
    group: Optional[str] = None
    description: Optional[str] = None


class ConfigOut(BaseModel):
    """管理后台完整配置项。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    config_key: str
    config_value: str
    config_group: str
    description: str
    updated_at: Optional[datetime] = None


class ConfigValueUpdate(BaseModel):
    """管理后台更新配置值。"""

    config_value: str
