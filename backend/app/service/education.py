from app.core.errors import NotFoundError
from app.db.models import ActivityCompletion
from app.db.uow import UnitOfWork
from app.domain.education.content import ACTIVITIES


class ActivityService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def complete(self, family_id: str, activity_id: str) -> None:
        if activity_id not in {activity["id"] for activity in ACTIVITIES}:
            raise NotFoundError("Такого задания нет.")
        self._uow.families.lock(family_id)
        if self._uow.activities.get(family_id, activity_id) is None:
            self._uow.activities.add(ActivityCompletion(family_id=family_id, activity_id=activity_id))
