from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings


def make_engine(url: str):
    engine = create_engine(
        url,
        connect_args={"check_same_thread": False, "timeout": 30} if url.startswith("sqlite") else {},
        pool_pre_ping=True,
    )
    if url.startswith("sqlite"):

        @event.listens_for(engine, "connect")
        def configure_sqlite(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
            connection.execute("PRAGMA journal_mode=WAL")

    return engine


class Database:
    def __init__(self, settings: Settings, *, engine: Engine | None = None):
        self.engine = engine if engine is not None else make_engine(settings.database_url)
        self.sessions = sessionmaker(self.engine, expire_on_commit=False, autoflush=False)

    def session(self) -> Session:
        return self.sessions()

    def dispose(self) -> None:
        self.engine.dispose()
