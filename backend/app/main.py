from datetime import UTC
from hashlib import sha256
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .config import settings
from .content import ACTIVITIES, MATERIALS
from .database import get_db
from .models import ActivityCompletion, DemoSession, Family, Feedback, Goal, Transaction, Wallet, now
from .schemas import Category, FeedbackIn, GoalIn, ResetIn, TransactionIn
from .services import create_demo, lock_family, record_transaction, reset_family

app = FastAPI(
    title="Коплю — Трачу — Помогаю", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json"
)
origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)
DB = Annotated[Session, Depends(get_db)]
COOKIE = "kopilka_demo"


@app.middleware("http")
async def security_headers(request: Request, call_next):
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        origin = request.headers.get("origin")
        if (origin and origin not in origins) or request.headers.get("sec-fetch-site") == "cross-site":
            return JSONResponse(status_code=403, content={"detail": "Этот источник запросов не разрешён."})
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    return response


@app.exception_handler(RequestValidationError)
async def invalid_input(_, exc):
    return JSONResponse(
        status_code=422, content={"detail": "Проверьте поля: сумму, дату и выбранные значения."}
    )


@app.exception_handler(SQLAlchemyError)
async def database_error(_, exc):
    # Do not expose SQL, credentials or database connection details to clients.
    import logging

    logging.getLogger(__name__).exception("Database request failed", exc_info=exc)
    return JSONResponse(
        status_code=503, content={"detail": "Не удалось сохранить данные. Попробуйте ещё раз."}
    )


def current_family(request: Request, db: DB):
    token = request.cookies.get(COOKIE, "")
    session = db.get(DemoSession, sha256(token.encode()).hexdigest()) if token else None
    if not session or session.expires_at.replace(tzinfo=UTC) < now():
        raise HTTPException(401, "Демо-сессия закончилась. Откройте демо ещё раз.")
    family = db.get(Family, session.family_id)
    if not family:
        raise HTTPException(401, "Откройте демо ещё раз.")
    return family


FamilyDep = Annotated[Family, Depends(current_family)]


def transaction_out(t):
    result = {
        key: getattr(t, key)
        for key in ("id", "kind", "category", "destination", "amount", "occurred_on", "note", "created_at")
    }
    result["created_at"] = t.created_at.replace(tzinfo=UTC)
    return result


def goal_out(goal, balance):
    if not goal:
        return None
    return {
        "title": goal.title,
        "target": goal.target,
        "saved": balance,
        "remaining": max(0, goal.target - balance),
        "progress": min(100, balance * 100 // goal.target),
        "achieved": balance >= goal.target,
        "illustration": goal.illustration,
    }


@app.get("/api/health")
def health(db: DB):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "mode": "isolated-demo"}


@app.post("/api/demo", status_code=201)
def start_demo(response: Response, db: DB, request: Request):
    if not settings.demo_enabled:
        raise HTTPException(403, "Демо сейчас недоступно.")
    # Reuse an unexpired browser session rather than silently creating a new family on retries.
    try:
        current_family(request, db)
        return {"mode": "demo"}
    except HTTPException:
        pass
    token = create_demo(db)
    response.set_cookie(
        COOKIE,
        token,
        max_age=30 * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="strict",
        path="/api",
    )
    return {"mode": "demo"}


@app.get("/api/state")
def state(family: FamilyDep, db: DB):
    # A shared row lock prevents a reset/transfer from producing a partially read snapshot.
    db.execute(select(Family.id).where(Family.id == family.id).with_for_update(read=True))
    balances = dict(
        db.execute(select(Wallet.category, Wallet.balance).where(Wallet.family_id == family.id)).all()
    )
    completions = db.scalars(
        select(ActivityCompletion).where(ActivityCompletion.family_id == family.id)
    ).all()
    completed = {c.activity_id: c.completed_at.replace(tzinfo=UTC) for c in completions}
    transactions = db.scalars(
        select(Transaction)
        .where(Transaction.family_id == family.id)
        .order_by(Transaction.occurred_on.desc(), Transaction.created_at.desc())
        .limit(5)
    ).all()
    return {
        "mode": "demo",
        "nickname": family.nickname,
        "balances": balances,
        "goal": goal_out(db.get(Goal, family.id), balances["save"]),
        "activities": [{**a, "completed_at": completed.get(a["id"])} for a in ACTIVITIES],
        "recent_transactions": [transaction_out(t) for t in transactions],
        "materials": MATERIALS,
        "transaction_count": db.scalar(
            select(func.count()).select_from(Transaction).where(Transaction.family_id == family.id)
        ),
    }


@app.get("/api/transactions")
def history(
    family: FamilyDep,
    db: DB,
    category: Category | None = None,
    kind: Annotated[str | None, Query(pattern="^(deposit|withdraw|transfer)$")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
):
    query = select(Transaction).where(Transaction.family_id == family.id)
    if category:
        query = query.where((Transaction.category == category) | (Transaction.destination == category))
    if kind:
        query = query.where(Transaction.kind == kind)
    items = db.scalars(
        query.order_by(Transaction.occurred_on.desc(), Transaction.created_at.desc())
        .offset(offset)
        .limit(limit + 1)
    ).all()
    return {"items": [transaction_out(t) for t in items[:limit]], "has_more": len(items) > limit}


@app.post("/api/transactions", status_code=201)
def add_transaction(data: TransactionIn, family: FamilyDep, db: DB):
    return transaction_out(record_transaction(db, family.id, data))


@app.put("/api/goal")
def save_goal(data: GoalIn, family: FamilyDep, db: DB):
    lock_family(db, family.id)
    goal = db.get(Goal, family.id)
    if not goal:
        goal = Goal(family_id=family.id, **data.model_dump())
        db.add(goal)
    else:
        for key, value in data.model_dump().items():
            setattr(goal, key, value)
    db.commit()
    return {"saved": True}


@app.put("/api/activities/{activity_id}/complete")
def complete_activity(activity_id: str, family: FamilyDep, db: DB):
    if activity_id not in {a["id"] for a in ACTIVITIES}:
        raise HTTPException(404, "Такого задания нет.")
    lock_family(db, family.id)
    if not db.get(ActivityCompletion, (family.id, activity_id)):
        db.add(ActivityCompletion(family_id=family.id, activity_id=activity_id))
    db.commit()
    return {"completed": True}


@app.post("/api/feedback", status_code=201)
def send_feedback(data: FeedbackIn, family: FamilyDep, db: DB):
    lock_family(db, family.id)
    feedback = Feedback(family_id=family.id, **data.model_dump(exclude={"adult_confirmed"}))
    db.add(feedback)
    db.commit()
    return {"saved": True, "id": feedback.id}


@app.get("/api/feedback/export")
def export_feedback(family: FamilyDep, db: DB):
    rows = db.scalars(
        select(Feedback).where(Feedback.family_id == family.id).order_by(Feedback.created_at.desc())
    ).all()
    return {
        "mode": "demo",
        "scope": "Только отзывы этой демо-сессии",
        "items": [
            {
                "usefulness": r.usefulness,
                "difficulty": r.difficulty,
                "comment": r.comment,
                "created_at": r.created_at.replace(tzinfo=UTC),
            }
            for r in rows
        ],
    }


@app.post("/api/demo/reset")
def reset_demo(data: ResetIn, family: FamilyDep, db: DB):
    reset_family(db, family.id, data.seeded)
    return {"reset": True}
