from pydantic import Field

from app.api.schemas.base import ApiModel, StrictModel
from app.api.schemas.transactions import Money
from app.domain.goal.models import GoalDraft, Illustration


class GoalIn(StrictModel):
    title: str = Field(min_length=2, max_length=60)
    target: Money
    illustration: Illustration = "bike"

    def to_domain(self) -> GoalDraft:
        return GoalDraft(**self.model_dump())


class GoalOut(ApiModel):
    title: str
    target: int
    saved: int
    remaining: int
    progress: int
    achieved: bool
    illustration: Illustration
