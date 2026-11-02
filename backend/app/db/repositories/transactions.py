from collections.abc import Sequence

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.domain.wallet.models import Category, Kind


class TransactionRepository:
    def __init__(self, session: Session):
        self._session = session

    def find_request(self, family_id: str, request_id: str) -> Transaction | None:
        return self._session.scalar(
            select(Transaction).where(
                Transaction.family_id == family_id,
                Transaction.request_id == request_id,
            )
        )

    def add(self, transaction: Transaction) -> None:
        self._session.add(transaction)

    def list(
        self,
        family_id: str,
        *,
        category: Category | None = None,
        kind: Kind | None = None,
        offset: int = 0,
        limit: int = 30,
    ) -> Sequence[Transaction]:
        query = select(Transaction).where(Transaction.family_id == family_id)
        if category:
            query = query.where((Transaction.category == category) | (Transaction.destination == category))
        if kind:
            query = query.where(Transaction.kind == kind)
        return self._session.scalars(
            query.order_by(
                Transaction.occurred_on.desc(),
                Transaction.created_at.desc(),
            )
            .offset(offset)
            .limit(limit)
        ).all()

    def count(self, family_id: str) -> int:
        return (
            self._session.scalar(
                select(func.count())
                .select_from(Transaction)
                .where(
                    Transaction.family_id == family_id,
                )
            )
            or 0
        )

    def clear(self, family_id: str) -> None:
        self._session.execute(delete(Transaction).where(Transaction.family_id == family_id))
