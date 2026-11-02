from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.db.models import Wallet
from app.domain.wallet.models import MAX_BALANCE, Category


class WalletRepository:
    def __init__(self, session: Session):
        self._session = session

    def balances(self, family_id: str) -> dict[Category, int]:
        return dict(
            self._session.execute(
                select(Wallet.category, Wallet.balance).where(Wallet.family_id == family_id)
            ).all()
        )

    def add(self, wallet: Wallet) -> None:
        self._session.add(wallet)

    def debit(self, family_id: str, category: Category, amount: int) -> bool:
        result = self._session.execute(
            update(Wallet)
            .where(
                Wallet.family_id == family_id,
                Wallet.category == category,
                Wallet.balance >= amount,
            )
            .values(balance=Wallet.balance - amount)
        )
        return result.rowcount == 1

    def credit(self, family_id: str, category: Category, amount: int) -> bool:
        result = self._session.execute(
            update(Wallet)
            .where(
                Wallet.family_id == family_id,
                Wallet.category == category,
                Wallet.balance <= MAX_BALANCE - amount,
            )
            .values(balance=Wallet.balance + amount)
        )
        return result.rowcount == 1

    def clear(self, family_id: str) -> None:
        self._session.execute(delete(Wallet).where(Wallet.family_id == family_id))
