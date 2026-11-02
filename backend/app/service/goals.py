from app.db.uow import UnitOfWork
from app.domain.goal.models import GoalDraft


class GoalService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def save(self, family_id: str, draft: GoalDraft) -> None:
        self._uow.families.lock(family_id)
        self._uow.goals.save(family_id, draft)
