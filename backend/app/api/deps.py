from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request

from app.api.cookies import COOKIE, PARENT_COOKIE
from app.core.config import Settings
from app.core.errors import ForbiddenError
from app.db.session import Database
from app.db.uow import UnitOfWork
from app.domain.family.models import CurrentFamily
from app.service.demo import DemoService
from app.service.parent_access import ParentAccess


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_database(request: Request) -> Database:
    return request.app.state.db


def get_uow(database: Annotated[Database, Depends(get_database)]) -> Iterator[UnitOfWork]:
    with UnitOfWork(database.session()) as uow:
        yield uow
        uow.commit()


SettingsDep = Annotated[Settings, Depends(get_settings)]
# Finalize the transaction before sending the HTTP response, including commit failures.
UowDep = Annotated[UnitOfWork, Depends(get_uow, scope="function")]


def current_family(request: Request, uow: UowDep) -> CurrentFamily:
    return DemoService(uow).current_family(request.cookies.get(COOKIE))


FamilyDep = Annotated[CurrentFamily, Depends(current_family)]


def current_parent(request: Request, family: FamilyDep, uow: UowDep) -> CurrentFamily:
    _, unlocked = ParentAccess(uow).status(family.id, request.cookies.get(PARENT_COOKIE))
    if not unlocked:
        raise ForbiddenError("Войдите в родительский режим.")
    return family


ParentDep = Annotated[CurrentFamily, Depends(current_parent)]
