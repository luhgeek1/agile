from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.db.models import DemoSession, Family


class FamilyRepository:
    def __init__(self, session: Session):
        self._session = session

    def get(self, family_id: str) -> Family | None:
        return self._session.get(Family, family_id)

    def add(self, family: Family) -> None:
        self._session.add(family)

    def lock(self, family_id: str) -> None:
        # This no-op UPDATE serializes writes on both SQLite and PostgreSQL.
        self._session.execute(update(Family).where(Family.id == family_id).values(nickname=Family.nickname))

    def lock_snapshot(self, family_id: str) -> None:
        self._session.execute(select(Family.id).where(Family.id == family_id).with_for_update(read=True))


class SessionRepository:
    def __init__(self, session: Session):
        self._session = session

    def get(self, token_hash: str) -> DemoSession | None:
        return self._session.get(DemoSession, token_hash)

    def add(self, session: DemoSession) -> None:
        self._session.add(session)
