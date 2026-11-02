from dataclasses import asdict
from datetime import UTC

from app.db.models import Feedback
from app.db.uow import UnitOfWork
from app.domain.feedback.models import FeedbackDraft


class FeedbackService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def submit(self, family_id: str, draft: FeedbackDraft) -> str:
        self._uow.families.lock(family_id)
        feedback = Feedback(family_id=family_id, **asdict(draft))
        self._uow.feedback.add(feedback)
        self._uow.flush()
        return feedback.id

    def export(self, family_id: str) -> dict:
        return {
            "mode": "demo",
            "scope": "Только отзывы этой демо-сессии",
            "items": [
                {
                    "usefulness": row.usefulness,
                    "difficulty": row.difficulty,
                    "comment": row.comment,
                    "created_at": row.created_at.replace(tzinfo=UTC),
                }
                for row in self._uow.feedback.list(family_id)
            ],
        }
