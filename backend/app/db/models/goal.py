from sqlalchemy import BigInteger, CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Goal(Base):
    __tablename__ = "goals"
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), primary_key=True)
    title: Mapped[str] = mapped_column(String(60))
    target: Mapped[int] = mapped_column(BigInteger)
    illustration: Mapped[str] = mapped_column(String(12), default="bike")
    __table_args__ = (CheckConstraint("target > 0 AND target <= 100000000", name="goal_target"),)
