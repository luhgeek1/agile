from fastapi import APIRouter

from app.api.deps import FamilyDep, UowDep
from app.api.schemas.system import CompletedOut
from app.service.education import ActivityService

router = APIRouter(prefix="/activities", tags=["activities"])


@router.put("/{activity_id}/complete", response_model=CompletedOut)
def complete_activity(activity_id: str, family: FamilyDep, uow: UowDep):
    ActivityService(uow).complete(family.id, activity_id)
    return {"completed": True}
