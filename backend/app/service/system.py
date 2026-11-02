from app.db.uow import UnitOfWork


class SystemService:
    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    def health(self) -> dict:
        self._uow.system.ping()
        return {"status": "ok", "mode": "isolated-demo"}
