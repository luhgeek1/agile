from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app.api.cookies import COOKIE, PARENT_COOKIE, clear_parent_cookie, set_demo_cookie, set_parent_cookie
from app.api.deps import FamilyDep, SettingsDep, UowDep
from app.api.schemas.demo import DemoOut, ParentPinIn, ParentStatusOut, ResetIn, ResetOut
from app.service.demo import DemoService
from app.service.parent_access import ParentAccess

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("", status_code=201, response_model=DemoOut)
def start_demo(response: Response, request: Request, settings: SettingsDep, uow: UowDep):
    service = DemoService(uow)
    existing_token = request.cookies.get(COOKIE)
    token = service.start(existing_token, enabled=settings.demo_enabled)
    if token is not None:
        set_demo_cookie(response, token, settings)
    parent_token = request.cookies.get(PARENT_COOKIE)
    if parent_token:
        if token is None:
            ParentAccess(uow).lock(service.current_family(existing_token).id, parent_token)
        clear_parent_cookie(response, settings)
    return {"mode": "demo"}


@router.post("/reset", response_model=ResetOut)
def reset_demo(data: ResetIn, family: FamilyDep, uow: UowDep):
    DemoService(uow).reset(family.id, seeded=data.seeded)
    return {"reset": True}


@router.get("/parent", response_model=ParentStatusOut)
def parent_status(request: Request, family: FamilyDep, uow: UowDep):
    configured, unlocked = ParentAccess(uow).status(family.id, request.cookies.get(PARENT_COOKIE))
    return {"configured": configured, "unlocked": unlocked}


@router.post("/parent", response_model=ParentStatusOut)
def unlock_parent(
    data: ParentPinIn, response: Response, settings: SettingsDep, family: FamilyDep, uow: UowDep
):
    token, failure = ParentAccess(uow).unlock(family.id, data.pin, setup=data.setup)
    if failure == "wrong_pin":
        return JSONResponse({"detail": "Неверный PIN. Попробуйте ещё раз."}, status_code=403)
    if failure == "blocked":
        return JSONResponse({"detail": "Слишком много попыток. Попробуйте через 5 минут."}, status_code=429)
    if failure == "setup_changed":
        return JSONResponse({"detail": "Настройка PIN изменилась. Обновите страницу."}, status_code=409)
    assert token is not None
    set_parent_cookie(response, token, settings)
    return {"configured": True, "unlocked": True}


@router.delete("/parent")
def lock_parent(request: Request, response: Response, settings: SettingsDep, family: FamilyDep, uow: UowDep):
    ParentAccess(uow).lock(family.id, request.cookies.get(PARENT_COOKIE))
    clear_parent_cookie(response, settings)
    return {"locked": True}
