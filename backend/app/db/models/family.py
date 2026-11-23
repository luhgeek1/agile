from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domain.common.clock import now, uid


class Family(Base):
    __tablename__ = "families"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    nickname: Mapped[str] = mapped_column(String(30), default="Саша")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    parent_pin_hash: Mapped[str | None] = mapped_column(String(97))
    parent_token_hash: Mapped[str | None] = mapped_column(String(64))
    parent_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    parent_failed_attempts: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    parent_blocked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class DemoSession(Base):
    __tablename__ = "demo_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
