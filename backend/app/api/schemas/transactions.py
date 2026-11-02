from datetime import date, datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from pydantic import Field, field_validator, model_validator

from app.api.schemas.base import ApiModel, StrictModel
from app.domain.wallet.models import MAX_OPERATION, Category, Kind, TransactionDraft

Money = Annotated[int, Field(strict=True, gt=0, le=MAX_OPERATION)]


class TransactionIn(StrictModel):
    request_id: UUID
    kind: Kind
    category: Category
    destination: Category | None = None
    amount: Money
    occurred_on: date
    note: str = Field(default="", max_length=160)

    @field_validator("occurred_on")
    @classmethod
    def valid_date(cls, value):
        today = datetime.now(timezone(timedelta(hours=3))).date()
        if value < date(2000, 1, 1) or value > today:
            raise ValueError("Выберите дату от 01.01.2000 до сегодняшнего дня")
        return value

    @model_validator(mode="after")
    def valid_transfer(self):
        if self.kind == "transfer":
            if self.destination is None or self.destination == self.category:
                raise ValueError("Выберите другой отсек для переноса")
        elif self.destination is not None:
            raise ValueError("Отсек назначения нужен только для переноса")
        return self

    def to_domain(self) -> TransactionDraft:
        return TransactionDraft(**self.model_dump(exclude={"request_id"}), request_id=str(self.request_id))


class TransactionOut(ApiModel):
    id: str
    kind: Kind
    category: Category
    destination: Category | None
    amount: int
    occurred_on: date
    note: str
    created_at: datetime


class HistoryOut(ApiModel):
    items: list[TransactionOut]
    has_more: bool
