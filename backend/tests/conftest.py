import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings
from app.db.base import Base
from app.db.session import Database, make_engine
from app.main import create_app


@pytest.fixture
def database(tmp_path):
    url = os.environ.get("TEST_DATABASE_URL")
    if url:
        base_engine = make_engine(url)
        schema = f"test_{uuid4().hex}"
        with base_engine.begin() as conn:
            conn.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = base_engine.execution_options(schema_translate_map={None: schema})
    else:
        engine = make_engine(f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.create_all(engine)
    sessions = sessionmaker(engine, expire_on_commit=False)

    yield sessions
    if url:
        with base_engine.begin() as conn:
            conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        base_engine.dispose()
    else:
        engine.dispose()


@pytest.fixture
def app(database):
    settings = Settings()
    return create_app(settings, database=Database(settings, engine=database.kw["bind"]))


@pytest.fixture
def client(app):
    with TestClient(app) as client:
        yield client


@pytest.fixture
def demo(client):
    assert client.post("/api/demo").status_code == 201
    return client
