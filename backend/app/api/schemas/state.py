from datetime import datetime
from typing import Literal

from app.api.schemas.base import ApiModel
from app.api.schemas.goals import GoalOut
from app.api.schemas.transactions import TransactionOut
from app.domain.wallet.models import Category


class ActivityOut(ApiModel):
    id: str
    category: Category
    title: str
    description: str
    steps: list[str]
    outcome: str
    duration: str
    tag: str
    completed_at: datetime | None


class MaterialOut(ApiModel):
    title: str
    body: str


class StateOut(ApiModel):
    mode: Literal["demo"]
    nickname: str
    balances: dict[Category, int]
    goal: GoalOut | None
    activities: list[ActivityOut]
    recent_transactions: list[TransactionOut]
    materials: list[MaterialOut]
    transaction_count: int
