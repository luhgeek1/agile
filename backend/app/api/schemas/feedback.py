from datetime import datetime
from typing import Annotated, Literal

from pydantic import Field

from app.api.schemas.base import ApiModel, StrictModel
from app.domain.feedback.models import FeedbackDraft


class FeedbackIn(StrictModel):
    usefulness: Annotated[int, Field(strict=True, ge=1, le=5)]
    difficulty: Literal["easy", "okay", "hard"]
    comment: str = Field(default="", max_length=1000)
    adult_confirmed: Literal[True]

    def to_domain(self) -> FeedbackDraft:
        return FeedbackDraft(**self.model_dump(exclude={"adult_confirmed"}))


class FeedbackSaved(ApiModel):
    saved: bool
    id: str


class FeedbackOut(ApiModel):
    usefulness: int
    difficulty: str
    comment: str
    created_at: datetime


class FeedbackExport(ApiModel):
    mode: Literal["demo"]
    scope: str
    items: list[FeedbackOut]
