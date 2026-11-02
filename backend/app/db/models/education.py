from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domain.common.clock import now


class ActivityCompletion(Base):
    __tablename__ = "activity_completions"
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), primary_key=True)
    activity_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
