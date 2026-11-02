from dataclasses import asdict
from datetime import UTC

from app.core.errors import ConflictError
from app.db.models import Transaction
from app.db.uow import UnitOfWork
from app.domain.wallet.models import Category, Kind, TransactionDraft, TransactionInfo


def transaction_info(transaction: Transaction) -> TransactionInfo:
    return TransactionInfo(
        id=transaction.id,
        kind=transaction.kind,
        category=transaction.category,
        destination=transaction.destination,
        amount=transaction.amount,
        occurred_on=transaction.occurred_on,
        note=transaction.note,
        created_at=transaction.created_at.replace(tzinfo=UTC),
    )


class TransactionService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def record(self, family_id: str, draft: TransactionDraft) -> TransactionInfo:
        self._uow.families.lock(family_id)
        existing = self._uow.transactions.find_request(family_id, draft.request_id)
        if existing is not None:
            fields = ("kind", "category", "destination", "amount", "occurred_on", "note")
            if any(getattr(existing, key) != getattr(draft, key) for key in fields):
                raise ConflictError("Эта запись уже сохранена с другими данными. Откройте форму заново.")
            return transaction_info(existing)
        if draft.kind in ("withdraw", "transfer") and not self._uow.wallets.debit(
            family_id, draft.category, draft.amount
        ):
            raise ConflictError("В этом отсеке не хватает денег. Проверьте сумму и попробуйте ещё раз.")
        if draft.kind in ("deposit", "transfer"):
            category = draft.destination if draft.kind == "transfer" else draft.category
            if not self._uow.wallets.credit(family_id, category, draft.amount):
                raise ConflictError("Сумма в отсеке слишком большая. Максимум — 10 миллионов рублей.")
        transaction = Transaction(family_id=family_id, **asdict(draft))
        self._uow.transactions.add(transaction)
        self._uow.flush()
        return transaction_info(transaction)

    def history(
        self,
        family_id: str,
        *,
        category: Category | None = None,
        kind: Kind | None = None,
        offset: int = 0,
        limit: int = 30,
    ) -> dict:
        items = self._uow.transactions.list(
            family_id, category=category, kind=kind, offset=offset, limit=limit + 1
        )
        return {"items": [transaction_info(item) for item in items[:limit]], "has_more": len(items) > limit}
