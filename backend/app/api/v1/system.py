from fastapi import APIRouter

from app.api.deps import UowDep
from app.api.schemas.system import HealthOut
from app.service.system import SystemService

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthOut)
def health(uow: UowDep):
    return SystemService(uow).health()
