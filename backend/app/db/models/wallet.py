from datetime import date, datetime

from sqlalchemy import BigInteger, CheckConstraint, Date, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domain.common.clock import now, uid


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
