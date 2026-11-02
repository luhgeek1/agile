from fastapi import APIRouter, Request, Response

from app.api.cookies import COOKIE, set_demo_cookie
from app.api.deps import FamilyDep, SettingsDep, UowDep
from app.api.schemas.demo import DemoOut, ResetIn, ResetOut
from app.service.demo import DemoService

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("", status_code=201, response_model=DemoOut)
def start_demo(response: Response, request: Request, settings: SettingsDep, uow: UowDep):
    token = DemoService(uow).start(request.cookies.get(COOKIE), enabled=settings.demo_enabled)
    if token is not None:
        set_demo_cookie(response, token, settings)
    return {"mode": "demo"}


@router.post("/reset", response_model=ResetOut)
def reset_demo(data: ResetIn, family: FamilyDep, uow: UowDep):
    DemoService(uow).reset(family.id, seeded=data.seeded)
    return {"reset": True}
