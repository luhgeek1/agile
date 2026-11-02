from datetime import UTC

from app.db.uow import UnitOfWork
from app.domain.education.content import ACTIVITIES, MATERIALS
from app.domain.family.models import CurrentFamily
from app.domain.goal.models import GoalDraft, goal_progress
from app.service.transactions import transaction_info


class StateService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def snapshot(self, family: CurrentFamily) -> dict:
        self._uow.families.lock_snapshot(family.id)
        balances = self._uow.wallets.balances(family.id)
        completed = {
            c.activity_id: c.completed_at.replace(tzinfo=UTC) for c in self._uow.activities.list(family.id)
        }
        goal = self._uow.goals.get(family.id)
        return {
            "mode": "demo",
            "nickname": family.nickname,
            "balances": balances,
            "goal": goal_progress(GoalDraft(goal.title, goal.target, goal.illustration), balances["save"])
            if goal
            else None,
            "activities": [
                {**activity, "completed_at": completed.get(activity["id"])} for activity in ACTIVITIES
            ],
            "recent_transactions": [
                transaction_info(t) for t in self._uow.transactions.list(family.id, limit=5)
            ],
            "materials": MATERIALS,
            "transaction_count": self._uow.transactions.count(family.id),
        }
