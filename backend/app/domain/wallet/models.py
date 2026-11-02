from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal

Category = Literal["save", "spend", "help"]
Kind = Literal["deposit", "withdraw", "transfer"]
CATEGORIES: tuple[Category, ...] = ("save", "spend", "help")
MAX_BALANCE = 1_000_000_000
MAX_OPERATION = 100_000_000


@dataclass(frozen=True, slots=True)
class TransactionDraft:
    request_id: str
    kind: Kind
    category: Category
    destination: Category | None
    amount: int
    occurred_on: date
    note: str = ""


@dataclass(frozen=True, slots=True)
class TransactionInfo:
    id: str
    kind: Kind
    category: Category
    destination: Category | None
    amount: int
    occurred_on: date
    note: str
    created_at: datetime
