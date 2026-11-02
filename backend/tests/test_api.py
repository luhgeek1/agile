from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.api.cookies import COOKIE
from app.db.models import DemoSession, Transaction, Wallet
from app.domain.common.clock import now


def payload(**overrides):
    return {
        "request_id": str(uuid4()),
        "kind": "deposit",
        "category": "save",
        "amount": 15000,
        "occurred_on": now().date().isoformat(),
        "note": "Проверка",
        **overrides,
    }


def state(client):
    response = client.get("/api/state")
    assert response.status_code == 200, response.text
    return response.json()


def test_health_and_cookie(client):
    assert client.get("/api/health").json()["status"] == "ok"
    response = client.post("/api/demo")
    assert response.status_code == 201
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie and "SameSite=strict" in cookie and "Path=/api" in cookie
    assert response.json() == {"mode": "demo"}
    assert set(state(client)["balances"]) == {"save", "spend", "help"}


@pytest.mark.parametrize("path", ["/state", "/transactions", "/feedback/export"])
def test_anonymous_denied(client, path):
    assert client.get(f"/api{path}").status_code == 401


def test_seed_and_exact_persistence(demo, app):
    before = state(demo)
    assert before["balances"] == {"save": 125000, "spend": 25000, "help": 20000}
    response = demo.post("/api/transactions", json=payload())
    assert response.status_code == 201
    after = state(demo)
    assert after["balances"]["save"] == before["balances"]["save"] + 15000
    assert after["goal"]["saved"] == after["balances"]["save"]
    assert after["recent_transactions"][0]["amount"] == 15000
    token = demo.cookies.get(COOKIE)
    with TestClient(app) as another_connection:
        another_connection.cookies.set(COOKIE, token, path="/api")
        assert state(another_connection)["balances"] == after["balances"]


@pytest.mark.parametrize("amount", [0, -1, 1.5, True, "15000", 100000001])
def test_amount_validation(demo, amount):
    assert demo.post("/api/transactions", json=payload(amount=amount)).status_code == 422
    assert state(demo)["balances"]["save"] == 125000


@pytest.mark.parametrize(
    "overrides",
    [
        {"occurred_on": "2099-01-01"},
        {"occurred_on": "1999-01-01"},
        {"occurred_on": "2026-02-30"},
        {"category": "unknown"},
        {"kind": "steal"},
        {"note": "x" * 161},
        {"currency": "USD"},
        {"destination": "spend"},
        {"request_id": "invalid"},
        {"family_id": "other"},
    ],
)
def test_transaction_validation(demo, overrides):
    assert demo.post("/api/transactions", json=payload(**overrides)).status_code == 422


def test_insufficient_funds_and_transfer_atomicity(demo):
    before = state(demo)["balances"]
    response = demo.post("/api/transactions", json=payload(kind="withdraw", amount=125001))
    assert response.status_code == 409
    assert "не хватает" in response.json()["detail"]
    assert state(demo)["balances"] == before
    assert (
        demo.post(
            "/api/transactions", json=payload(kind="transfer", destination="help", amount=15000)
        ).status_code
        == 201
    )
    after = state(demo)["balances"]
    assert after["save"] == before["save"] - 15000
    assert after["help"] == before["help"] + 15000
    assert sum(after.values()) == sum(before.values())
    assert (
        demo.post("/api/transactions", json=payload(kind="transfer", destination="save")).status_code == 422
    )


def test_transfer_rolls_back_debit_if_destination_full(demo, database):
    with database() as db:
        db.execute(update(Wallet).where(Wallet.category == "help").values(balance=1_000_000_000))
        db.commit()
    before = state(demo)["balances"]
    assert (
        demo.post("/api/transactions", json=payload(kind="transfer", destination="help")).status_code == 409
    )
    assert state(demo)["balances"] == before


def test_idempotency(demo):
    data = payload()
    first = demo.post("/api/transactions", json=data)
    second = demo.post("/api/transactions", json=data)
    assert first.json()["id"] == second.json()["id"]
    assert state(demo)["balances"]["save"] == 140000
    assert demo.post("/api/transactions", json={**data, "amount": 100}).status_code == 409


def test_goal_follows_actual_balance(demo):
    assert (
        demo.put("/api/goal", json={"title": "Книга", "target": 200000, "illustration": "book"}).status_code
        == 200
    )
    assert state(demo)["goal"]["progress"] == 62
    demo.post("/api/transactions", json=payload(amount=75000))
    goal = state(demo)["goal"]
    assert goal["achieved"] and goal["remaining"] == 0 and goal["progress"] == 100
    demo.post("/api/transactions", json=payload(kind="withdraw", amount=50000))
    goal = state(demo)["goal"]
    assert not goal["achieved"] and goal["progress"] == 75
    assert demo.put("/api/goal", json={"title": " ", "target": 0}).status_code == 422


def test_activities_are_persistent_idempotent_and_not_money(demo):
    before = state(demo)["balances"]
    for _ in range(2):
        assert demo.put("/api/activities/kindness/complete").status_code == 200
    after = state(demo)
    assert next(a for a in after["activities"] if a["id"] == "kindness")["completed_at"]
    assert after["balances"] == before
    assert demo.put("/api/activities/unknown/complete").status_code == 404


def test_feedback_validation_persistence_and_safe_export(demo):
    data = {"usefulness": 5, "difficulty": "easy", "comment": "Удобно", "adult_confirmed": True}
    assert demo.post("/api/feedback", json={**data, "adult_confirmed": False}).status_code == 422
    assert demo.post("/api/feedback", json={**data, "usefulness": 6}).status_code == 422
    assert demo.post("/api/feedback", json=data).status_code == 201
    export = demo.get("/api/feedback/export").json()
    assert export["items"][0]["comment"] == "Удобно"
    assert "family_id" not in str(export) and "token" not in str(export)


def test_family_isolation_and_reset_scope(demo, app):
    first_state = state(demo)
    with TestClient(app) as other:
        other.post("/api/demo")
        other.post("/api/transactions", json=payload(amount=1))
        other.post("/api/feedback", json={"usefulness": 3, "difficulty": "okay", "adult_confirmed": True})
        assert state(demo)["balances"] == first_state["balances"]
        assert demo.get("/api/feedback/export").json()["items"] == []
        demo.post("/api/demo/reset", json={"seeded": False})
        assert state(other)["balances"]["save"] == first_state["balances"]["save"] + 1
        assert len(other.get("/api/feedback/export").json()["items"]) == 1
    empty = state(demo)
    assert empty["balances"] == {"save": 0, "spend": 0, "help": 0}
    assert empty["goal"] is None and empty["recent_transactions"] == []
    assert not any(a["completed_at"] for a in empty["activities"])
    demo.post("/api/demo/reset", json={"seeded": True})
    assert state(demo)["balances"] == first_state["balances"]


def test_session_reuse_and_expiration(demo, database):
    token = demo.cookies.get(COOKIE)
    demo.post("/api/demo")
    assert demo.cookies.get(COOKIE) == token
    with database() as db:
        db.execute(update(DemoSession).values(expires_at=now() - timedelta(days=1)))
        db.commit()
    assert demo.get("/api/state").status_code == 401
    demo.post("/api/demo")
    assert demo.cookies.get(COOKIE) != token


def test_origin_protection(demo):
    assert (
        demo.post("/api/transactions", json=payload(), headers={"Origin": "https://evil.example"}).status_code
        == 403
    )
    assert demo.post("/api/demo", headers={"Sec-Fetch-Site": "cross-site"}).status_code == 403


def test_history_filter_and_pagination(demo):
    data = demo.get("/api/transactions?category=spend&kind=withdraw").json()
    assert len(data["items"]) == 1 and data["items"][0]["kind"] == "withdraw"
    data = demo.get("/api/transactions?limit=2").json()
    assert len(data["items"]) == 2 and data["has_more"]
    assert len(demo.get("/api/transactions?limit=2&offset=2").json()["items"]) == 2
    assert demo.get("/api/transactions?limit=101").status_code == 422
    assert demo.get("/api/transactions?kind=invalid").status_code == 422


def test_concurrent_withdrawals_cannot_overdraw(demo, database, app):
    token = demo.cookies.get(COOKIE)

    def withdraw(_):
        with TestClient(app) as conn:
            conn.cookies.set(COOKIE, token, path="/api")
            return conn.post(
                "/api/transactions", json=payload(kind="withdraw", category="help", amount=20000)
            ).status_code

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(withdraw, range(8)))
    assert results.count(201) == 1 and results.count(409) == 7
    assert state(demo)["balances"]["help"] == 0
    with database() as db:
        withdrawals = db.scalars(
            select(Transaction).where(Transaction.category == "help", Transaction.kind == "withdraw")
        ).all()
        assert len(withdrawals) == 1


def test_concurrent_same_request_is_recorded_once(demo, app):
    token = demo.cookies.get(COOKIE)
    data = payload(amount=1)

    def deposit(_):
        with TestClient(app) as conn:
            conn.cookies.set(COOKIE, token, path="/api")
            return conn.post("/api/transactions", json=data)

    with ThreadPoolExecutor(max_workers=6) as executor:
        results = list(executor.map(deposit, range(6)))
    assert all(r.status_code == 201 for r in results)
    assert len({r.json()["id"] for r in results}) == 1
    assert state(demo)["balances"]["save"] == 125001


def test_database_rejects_transfer_without_destination(demo, database):
    with database() as db:
        wallet = db.scalar(select(Wallet))
        db.add(
            Transaction(
                family_id=wallet.family_id,
                request_id=str(uuid4()),
                kind="transfer",
                category="save",
                destination=None,
                amount=100,
                occurred_on=now().date(),
                note="",
            )
        )
        with pytest.raises(IntegrityError):
            db.commit()


def test_public_timestamps_include_timezone(demo):
    data = state(demo)
    assert data["recent_transactions"][0]["created_at"].endswith(("Z", "+00:00"))
    assert next(a for a in data["activities"] if a["completed_at"])["completed_at"].endswith(("Z", "+00:00"))
