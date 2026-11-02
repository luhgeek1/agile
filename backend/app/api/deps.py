from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request

from app.api.cookies import COOKIE
from app.core.config import Settings
from app.db.session import Database
from app.db.uow import UnitOfWork
from app.domain.family.models import CurrentFamily
from app.service.demo import DemoService


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
