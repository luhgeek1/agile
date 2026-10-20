from datetime import date, datetime, timedelta, timezone
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Category = Literal["save", "spend", "help"]
Money = Annotated[int, Field(strict=True, gt=0, le=100_000_000)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class TransactionIn(StrictModel):
    request_id: UUID
    kind: Literal["deposit", "withdraw", "transfer"]
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


class GoalIn(StrictModel):
    title: str = Field(min_length=2, max_length=60)
    target: Money
    illustration: Literal["bike", "book", "skates", "star"] = "bike"


class FeedbackIn(StrictModel):
    usefulness: Annotated[int, Field(strict=True, ge=1, le=5)]
    difficulty: Literal["easy", "okay", "hard"]
    comment: str = Field(default="", max_length=1000)
    adult_confirmed: Literal[True]


class ResetIn(StrictModel):
    seeded: bool = True
