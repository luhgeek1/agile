from collections.abc import Sequence

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import Feedback


class FeedbackRepository:
    def __init__(self, session: Session):
        self._session = session

    def add(self, feedback: Feedback) -> None:
        self._session.add(feedback)

    def list(self, family_id: str) -> Sequence[Feedback]:
        return self._session.scalars(
            select(Feedback)
            .where(
                Feedback.family_id == family_id,
            )
            .order_by(Feedback.created_at.desc())
        ).all()

    def clear(self, family_id: str) -> None:
        self._session.execute(delete(Feedback).where(Feedback.family_id == family_id))
