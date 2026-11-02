from fastapi import APIRouter

from app.api.deps import FamilyDep, UowDep
from app.api.schemas.goals import GoalIn
from app.api.schemas.system import SavedOut
from app.service.goals import GoalService

router = APIRouter(tags=["goals"])


@router.put("/goal", response_model=SavedOut)
def save_goal(data: GoalIn, family: FamilyDep, uow: UowDep):
    GoalService(uow).save(family.id, data.to_domain())
    return {"saved": True}
