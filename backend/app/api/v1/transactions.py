from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import FamilyDep, UowDep
from app.api.schemas.transactions import HistoryOut, TransactionIn, TransactionOut
from app.domain.wallet.models import Category
from app.service.transactions import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=HistoryOut)
def history(
    family: FamilyDep,
    uow: UowDep,
    category: Category | None = None,
    kind: Annotated[str | None, Query(pattern="^(deposit|withdraw|transfer)$")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
):
    return TransactionService(uow).history(
        family.id, category=category, kind=kind, offset=offset, limit=limit
    )


@router.post("", status_code=201, response_model=TransactionOut)
def add_transaction(data: TransactionIn, family: FamilyDep, uow: UowDep):
    return TransactionService(uow).record(family.id, data.to_domain())
