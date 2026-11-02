from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domain.common.clock import now, uid


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
