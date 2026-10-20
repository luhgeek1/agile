from datetime import UTC, date, datetime
from uuid import uuid4

from sqlalchemy import BigInteger, CheckConstraint, Date, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def uid():
    return str(uuid4())


def now():
    return datetime.now(UTC)


class Family(Base):
    __tablename__ = "families"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    nickname: Mapped[str] = mapped_column(String(30), default="Саша")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class DemoSession(Base):
    __tablename__ = "demo_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Wallet(Base):
    __tablename__ = "wallets"
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), primary_key=True)
    category: Mapped[str] = mapped_column(String(8), primary_key=True)
    balance: Mapped[int] = mapped_column(BigInteger, default=0)
    __table_args__ = (
        CheckConstraint("balance >= 0 AND balance <= 1000000000", name="wallet_balance_bounds"),
        CheckConstraint("category IN ('save','spend','help')", name="wallet_category"),
    )


class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    request_id: Mapped[str] = mapped_column(String(36))
    kind: Mapped[str] = mapped_column(String(10))
    category: Mapped[str] = mapped_column(String(8))
    destination: Mapped[str | None] = mapped_column(String(8))
    amount: Mapped[int] = mapped_column(BigInteger)
    occurred_on: Mapped[date] = mapped_column(Date)
    note: Mapped[str] = mapped_column(String(160), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (
        UniqueConstraint("family_id", "request_id", name="transaction_idempotency"),
        CheckConstraint("amount > 0 AND amount <= 100000000", name="transaction_amount"),
        CheckConstraint("kind IN ('deposit','withdraw','transfer')", name="transaction_kind"),
        CheckConstraint("category IN ('save','spend','help')", name="transaction_category"),
        CheckConstraint(
            "(kind = 'transfer' AND destination IS NOT NULL AND destination IN ('save','spend','help') "
            "AND destination <> category) OR (kind <> 'transfer' AND destination IS NULL)",
            name="transfer_destination",
        ),
    )


class Goal(Base):
    __tablename__ = "goals"
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), primary_key=True)
    title: Mapped[str] = mapped_column(String(60))
    target: Mapped[int] = mapped_column(BigInteger)
    illustration: Mapped[str] = mapped_column(String(12), default="bike")
    __table_args__ = (CheckConstraint("target > 0 AND target <= 100000000", name="goal_target"),)


class ActivityCompletion(Base):
    __tablename__ = "activity_completions"
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), primary_key=True)
    activity_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    usefulness: Mapped[int]
    difficulty: Mapped[str] = mapped_column(String(12))
    comment: Mapped[str] = mapped_column(String(1000), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (
        CheckConstraint("usefulness BETWEEN 1 AND 5", name="feedback_rating"),
        CheckConstraint("difficulty IN ('easy','okay','hard')", name="feedback_difficulty"),
    )
