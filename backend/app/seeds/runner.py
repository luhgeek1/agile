from datetime import timedelta
from uuid import uuid4

from app.db.models import ActivityCompletion, Transaction, Wallet
from app.db.uow import UnitOfWork
from app.domain.common.clock import now
from app.domain.goal.models import GoalDraft
from app.domain.wallet.models import CATEGORIES


def seed_family(uow: UnitOfWork, family_id: str, seeded: bool = True) -> None:
    for category in CATEGORIES:
        uow.wallets.add(Wallet(family_id=family_id, category=category, balance=0))
    uow.flush()
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
        uow.transactions.add(
            Transaction(
                family_id=family_id,
                request_id=str(uuid4()),
                kind=kind,
                category=category,
                amount=amount,
                occurred_on=today - timedelta(days=days),
                note=note,
                created_at=now() - timedelta(days=days),
            )
        )
        if kind == "deposit":
            uow.wallets.credit(family_id, category, amount)
        else:
            uow.wallets.debit(family_id, category, amount)
    uow.goals.save(family_id, GoalDraft("Мой первый велосипед", 250000, "bike"))
    uow.activities.add(
        ActivityCompletion(
            family_id=family_id,
            activity_id="dream",
            completed_at=now() - timedelta(days=2),
        )
    )
