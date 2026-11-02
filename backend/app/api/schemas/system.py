from typing import Literal

from app.api.schemas.base import ApiModel


class HealthOut(ApiModel):
    status: Literal["ok"]
    mode: Literal["isolated-demo"]


class SavedOut(ApiModel):
    saved: bool


class CompletedOut(ApiModel):
    completed: bool
