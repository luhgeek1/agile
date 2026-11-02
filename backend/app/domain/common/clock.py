from datetime import UTC, datetime
from uuid import uuid4


def now() -> datetime:
    return datetime.now(UTC)


def uid() -> str:
    return str(uuid4())
