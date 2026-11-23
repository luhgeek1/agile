from typing import Literal

from pydantic import Field

from app.api.schemas.base import ApiModel, StrictModel


class ResetIn(StrictModel):
    seeded: bool = True


class DemoOut(ApiModel):
    mode: Literal["demo"]


class ResetOut(ApiModel):
    reset: bool


class ParentPinIn(StrictModel):
    pin: str = Field(pattern=r"^[0-9]{4}$")
    setup: bool = False


class ParentStatusOut(ApiModel):
    configured: bool
    unlocked: bool
