from typing import Literal

from app.api.schemas.base import ApiModel, StrictModel


class ResetIn(StrictModel):
    seeded: bool = True


class DemoOut(ApiModel):
    mode: Literal["demo"]


class ResetOut(ApiModel):
    reset: bool
