from sqlalchemy import select
from sqlalchemy.orm import Session


class SystemRepository:
    def __init__(self, session: Session):
        self._session = session

    def ping(self) -> None:
        self._session.execute(select(1))
