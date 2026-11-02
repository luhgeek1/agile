from fastapi import APIRouter

from app.api.deps import FamilyDep, UowDep
from app.api.schemas.feedback import FeedbackExport, FeedbackIn, FeedbackSaved
from app.service.feedback import FeedbackService

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", status_code=201, response_model=FeedbackSaved)
def send_feedback(data: FeedbackIn, family: FamilyDep, uow: UowDep):
    return {"saved": True, "id": FeedbackService(uow).submit(family.id, data.to_domain())}


@router.get("/export", response_model=FeedbackExport)
def export_feedback(family: FamilyDep, uow: UowDep):
    return FeedbackService(uow).export(family.id)
