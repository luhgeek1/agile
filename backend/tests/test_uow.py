import pytest
from sqlalchemy import func, select

from app.db.models import Family, Wallet
from app.db.uow import UnitOfWork


def test_unit_of_work_rolls_back_all_repositories_on_error(database):
    with pytest.raises(RuntimeError, match="cancel"), UnitOfWork(database()) as uow:
        family = Family()
        uow.families.add(family)
        uow.flush()
        uow.wallets.add(Wallet(family_id=family.id, category="save", balance=100))
        uow.flush()
        raise RuntimeError("cancel")
    with database() as session:
        assert session.scalar(select(func.count()).select_from(Family)) == 0
        assert session.scalar(select(func.count()).select_from(Wallet)) == 0


def test_unit_of_work_requires_explicit_commit(database):
    with UnitOfWork(database()) as uow:
        uow.families.add(Family())
        uow.flush()
    with database() as session:
        assert session.scalar(select(func.count()).select_from(Family)) == 0
    with UnitOfWork(database()) as uow:
        uow.families.add(Family())
        uow.commit()
    with database() as session:
        assert session.scalar(select(func.count()).select_from(Family)) == 1
