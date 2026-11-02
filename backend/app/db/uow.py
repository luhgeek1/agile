from types import TracebackType
from typing import Self

from sqlalchemy.orm import Session

from app.db.repositories.education import ActivityRepository
from app.db.repositories.families import FamilyRepository, SessionRepository
from app.db.repositories.feedback import FeedbackRepository
from app.db.repositories.goals import GoalRepository
from app.db.repositories.transactions import TransactionRepository
from app.db.repositories.wallets import WalletRepository


class UnitOfWork:
    """One database transaction, shared by all repositories in a use case."""

    def __init__(self, session: Session):
        self.session = session
        self.families = FamilyRepository(session)
        self.sessions = SessionRepository(session)
        self.wallets = WalletRepository(session)
        self.transactions = TransactionRepository(session)
        self.goals = GoalRepository(session)
        self.activities = ActivityRepository(session)
        self.feedback = FeedbackRepository(session)

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self, exc_type: type[BaseException] | None, exc: BaseException | None, tb: TracebackType | None
    ) -> None:
        try:
            if exc_type is not None:
                self.rollback()
        finally:
            self.session.close()

    def flush(self) -> None:
        self.session.flush()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()
