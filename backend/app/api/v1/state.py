from fastapi import APIRouter

from app.api.deps import FamilyDep, UowDep
from app.api.schemas.state import StateOut
from app.service.state import StateService

router = APIRouter(tags=["state"])


@router.get("/state", response_model=StateOut)
def state(family: FamilyDep, uow: UowDep):
    return StateService(uow).snapshot(family)
