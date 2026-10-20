from datetime import timedelta
from hashlib import sha256
from secrets import token_urlsafe
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from .models import ActivityCompletion, DemoSession, Family, Feedback, Goal, Transaction, Wallet, now
from .schemas import TransactionIn

CATEGORIES = ("save", "spend", "help")


def lock_family(db: Session, family_id: str):
    # Serializes a family's mutations across processes, including reset and idempotent retries.
    # UPDATE acquires a write lock on SQLite as well as a row lock on PostgreSQL.
    db.execute(update(Family).where(Family.id == family_id).values(nickname=Family.nickname))


def seed_family(db: Session, family_id: str, seeded: bool = True):
    db.add_all([Wallet(family_id=family_id, category=c, balance=0) for c in CATEGORIES])
    db.flush()
    if not seeded:
        return
    today = (now() + timedelta(hours=3)).date()
    entries = [
        ("deposit", "save", 50000, 8, "Подарок на день рождения"),
        ("deposit", "spend", 35000, 6, "Карманные деньги"),
        ("deposit", "help", 20000, 5, "Оставил на добрые дела"),
        ("deposit", "save", 35000, 3, "Ещё один шаг к велосипеду"),
        ("withdraw", "spend", 10000, 2, "Набор цветных карандашей"),
        ("deposit", "save", 40000, 1, "Пополнение копилки"),
    ]
    for kind, category, amount, days, note in entries:
        recorded = now() - timedelta(days=days)
        db.add(
            Transaction(
                family_id=family_id,
                request_id=str(uuid4()),
                kind=kind,
                category=category,
                amount=amount,
                occurred_on=today - timedelta(days=days),
                note=note,
                created_at=recorded,
            )
        )
        delta = amount if kind == "deposit" else -amount
        db.execute(
            update(Wallet)
            .where(Wallet.family_id == family_id, Wallet.category == category)
            .values(balance=Wallet.balance + delta)
        )
    db.add(Goal(family_id=family_id, title="Мой первый велосипед", target=250000, illustration="bike"))
    db.add(
        ActivityCompletion(family_id=family_id, activity_id="dream", completed_at=now() - timedelta(days=2))
    )


def create_demo(db: Session):
    token = token_urlsafe(48)
    family = Family()
    db.add(family)
    db.flush()
    db.add(
        DemoSession(
            token_hash=sha256(token.encode()).hexdigest(),
            family_id=family.id,
            expires_at=now() + timedelta(days=30),
        )
    )
    seed_family(db, family.id)
    db.commit()
    return token


def record_transaction(db: Session, family_id: str, data: TransactionIn):
    lock_family(db, family_id)
    existing = db.scalar(
        select(Transaction).where(
            Transaction.family_id == family_id, Transaction.request_id == str(data.request_id)
        )
    )
    if existing:
        fields = ("kind", "category", "destination", "amount", "occurred_on", "note")
        if any(getattr(existing, key) != getattr(data, key) for key in fields):
            raise HTTPException(409, "Эта запись уже сохранена с другими данными. Откройте форму заново.")
        db.commit()
        return existing
    if data.kind in ("withdraw", "transfer"):
        result = db.execute(
            update(Wallet)
            .where(
                Wallet.family_id == family_id, Wallet.category == data.category, Wallet.balance >= data.amount
            )
            .values(balance=Wallet.balance - data.amount)
        )
        if result.rowcount != 1:
            raise HTTPException(409, "В этом отсеке не хватает денег. Проверьте сумму и попробуйте ещё раз.")
    if data.kind in ("deposit", "transfer"):
        category = data.destination if data.kind == "transfer" else data.category
        result = db.execute(
            update(Wallet)
            .where(
                Wallet.family_id == family_id,
                Wallet.category == category,
                Wallet.balance <= 1_000_000_000 - data.amount,
            )
            .values(balance=Wallet.balance + data.amount)
        )
        if result.rowcount != 1:
            raise HTTPException(409, "Сумма в отсеке слишком большая. Максимум — 10 миллионов рублей.")
    values = data.model_dump(exclude={"request_id"})
    transaction = Transaction(family_id=family_id, request_id=str(data.request_id), **values)
    db.add(transaction)
    db.commit()
    return transaction


def reset_family(db: Session, family_id: str, seeded: bool):
    lock_family(db, family_id)
    for model in (Transaction, Goal, ActivityCompletion, Feedback, Wallet):
        db.execute(delete(model).where(model.family_id == family_id))
    seed_family(db, family_id, seeded)
    db.commit()
