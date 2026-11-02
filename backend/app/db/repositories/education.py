from collections.abc import Sequence

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import ActivityCompletion


class ActivityRepository:
    def __init__(self, session: Session):
        self._session = session

    def list(self, family_id: str) -> Sequence[ActivityCompletion]:
        return self._session.scalars(
            select(ActivityCompletion).where(
                ActivityCompletion.family_id == family_id,
            )
        ).all()

    def get(self, family_id: str, activity_id: str) -> ActivityCompletion | None:
        return self._session.get(ActivityCompletion, (family_id, activity_id))

    def add(self, completion: ActivityCompletion) -> None:
        self._session.add(completion)

    def clear(self, family_id: str) -> None:
        self._session.execute(delete(ActivityCompletion).where(ActivityCompletion.family_id == family_id))
