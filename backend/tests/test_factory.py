from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.exc import OperationalError

from app.core.config import Settings
from app.db.models import DemoSession, Family
from app.db.session import Database
from app.db.uow import UnitOfWork
from app.main import create_app


def test_factory_does_not_create_database_before_startup_and_disposes_after_shutdown(monkeypatch):
    events = []

    class DatabaseProbe:
        def __init__(self, settings):
            events.append("open")

        def dispose(self):
            events.append("close")

    monkeypatch.setattr("app.main.Database", DatabaseProbe)
    application = create_app(Settings())
    assert events == []
    with TestClient(application):
        assert events == ["open"]
    assert events == ["open", "close"]


def test_app_settings_are_isolated_between_factory_instances(database):
    enabled = Settings(demo_enabled=True)
    disabled = Settings(demo_enabled=False)
    resource = Database(enabled, engine=database.kw["bind"])
    with (
        TestClient(create_app(disabled, database=resource)) as first,
        TestClient(create_app(enabled, database=resource)) as second,
    ):
        assert first.post("/api/demo").status_code == 403
        assert second.post("/api/demo").status_code == 201
        assert first.post("/api/demo").status_code == 403


def test_failed_commit_returns_error_before_cookie_and_rolls_back(client, database, monkeypatch):
    def fail_commit(self):
        raise OperationalError("COMMIT", {}, Exception("private-database-detail"))

    monkeypatch.setattr(UnitOfWork, "commit", fail_commit)
    response = client.post("/api/demo")
    assert response.status_code == 503
    assert "set-cookie" not in response.headers
    assert "private-database-detail" not in response.text
    with database() as session:
        assert session.scalar(select(func.count()).select_from(Family)) == 0
        assert session.scalar(select(func.count()).select_from(DemoSession)) == 0
