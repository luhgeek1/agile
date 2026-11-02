from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.db.models import Goal
from app.domain.goal.models import GoalDraft


class GoalRepository:
    def __init__(self, session: Session):
        self._session = session

    def get(self, family_id: str) -> Goal | None:
        return self._session.get(Goal, family_id)

    def save(self, family_id: str, draft: GoalDraft) -> None:
        goal = self.get(family_id)
        if goal is None:
            self._session.add(
                Goal(
                    family_id=family_id,
                    title=draft.title,
                    target=draft.target,
                    illustration=draft.illustration,
                )
            )
        else:
            goal.title, goal.target, goal.illustration = draft.title, draft.target, draft.illustration

    def clear(self, family_id: str) -> None:
        self._session.execute(delete(Goal).where(Goal.family_id == family_id))
