from datetime import UTC, timedelta
from hashlib import sha256
from secrets import token_urlsafe

from app.core.errors import ForbiddenError, UnauthorizedError
from app.db.models import DemoSession, Family
from app.db.uow import UnitOfWork
from app.domain.common.clock import now
from app.domain.family.models import CurrentFamily
from app.seeds.runner import seed_family


class DemoService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def current_family(self, token: str | None) -> CurrentFamily:
        session = self._uow.sessions.get(sha256(token.encode()).hexdigest()) if token else None
        if session is None or session.expires_at.replace(tzinfo=UTC) < now():
            raise UnauthorizedError("Демо-сессия закончилась. Откройте демо ещё раз.")
        family = self._uow.families.get(session.family_id)
        if family is None:
            raise UnauthorizedError("Откройте демо ещё раз.")
        return CurrentFamily(id=family.id, nickname=family.nickname)

    def start(self, existing_token: str | None, *, enabled: bool) -> str | None:
        if not enabled:
            raise ForbiddenError("Демо сейчас недоступно.")
        try:
            self.current_family(existing_token)
            return None
        except UnauthorizedError:
            pass
        token = token_urlsafe(48)
        family = Family()
        self._uow.families.add(family)
        self._uow.flush()
        self._uow.sessions.add(
            DemoSession(
                token_hash=sha256(token.encode()).hexdigest(),
                family_id=family.id,
                expires_at=now() + timedelta(days=30),
            )
        )
        seed_family(self._uow, family.id)
        return token

    def reset(self, family_id: str, *, seeded: bool) -> None:
        self._uow.families.lock(family_id)
        for repository in (
            self._uow.transactions,
            self._uow.goals,
            self._uow.activities,
            self._uow.feedback,
            self._uow.wallets,
        ):
            repository.clear(family_id)
        seed_family(self._uow, family_id, seeded)
