from datetime import UTC, timedelta
from hashlib import pbkdf2_hmac, sha256
from hmac import compare_digest
from secrets import token_bytes, token_urlsafe
from typing import Literal

from app.db.uow import UnitOfWork
from app.domain.common.clock import now

ACCESS_AGE_SECONDS = 15 * 60
PinFailure = Literal["wrong_pin", "blocked", "setup_changed"]


def _pin_digest(pin: str, salt: bytes) -> str:
    return pbkdf2_hmac("sha256", pin.encode(), salt, 600_000).hex()


class ParentAccess:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def status(self, family_id: str, token: str | None) -> tuple[bool, bool]:
        family = self._uow.families.get(family_id)
        if family is None:
            return False, False
        unlocked = bool(
            token
            and family.parent_token_hash
            and family.parent_token_expires_at
            and family.parent_token_expires_at.replace(tzinfo=UTC) > now()
            and compare_digest(family.parent_token_hash, sha256(token.encode()).hexdigest())
        )
        return family.parent_pin_hash is not None, unlocked

    def unlock(self, family_id: str, pin: str, *, setup: bool) -> tuple[str | None, PinFailure | None]:
        family = self._uow.families.get_for_update(family_id)
        current_time = now()
        if family.parent_blocked_until and family.parent_blocked_until.replace(tzinfo=UTC) > current_time:
            return None, "blocked"
        if family.parent_blocked_until:
            family.parent_blocked_until = None
            family.parent_failed_attempts = 0
        if setup != (family.parent_pin_hash is None):
            return None, "setup_changed"
        if family.parent_pin_hash is None:
            salt = token_bytes(16)
            family.parent_pin_hash = f"{salt.hex()}:{_pin_digest(pin, salt)}"
        else:
            salt_hex, digest = family.parent_pin_hash.split(":", 1)
            if not compare_digest(digest, _pin_digest(pin, bytes.fromhex(salt_hex))):
                family.parent_failed_attempts += 1
                if family.parent_failed_attempts >= 5:
                    family.parent_blocked_until = current_time + timedelta(minutes=5)
                    return None, "blocked"
                return None, "wrong_pin"

        token = token_urlsafe(32)
        family.parent_failed_attempts = 0
        family.parent_token_hash = sha256(token.encode()).hexdigest()
        family.parent_token_expires_at = current_time + timedelta(seconds=ACCESS_AGE_SECONDS)
        return token, None

    def lock(self, family_id: str, token: str | None) -> None:
        if not token:
            return
        family = self._uow.families.get_for_update(family_id)
        if family.parent_token_hash and compare_digest(
            family.parent_token_hash, sha256(token.encode()).hexdigest()
        ):
            family.parent_token_hash = None
            family.parent_token_expires_at = None
