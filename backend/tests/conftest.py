import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db, make_engine
from app.main import app


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

    def test_db():
        with sessions() as db:
            yield db

    app.dependency_overrides[get_db] = test_db
    yield sessions
    app.dependency_overrides.clear()
    if url:
        with base_engine.begin() as conn:
            conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        base_engine.dispose()
    else:
        engine.dispose()


@pytest.fixture
def client(database):
    with TestClient(app) as client:
        yield client


@pytest.fixture
def demo(client):
    assert client.post("/api/demo").status_code == 201
    return client
