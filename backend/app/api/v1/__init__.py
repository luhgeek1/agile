from fastapi import APIRouter

from app.api.v1 import demo, education, feedback, goals, state, system, transactions

# Preserve the existing frontend contract while organizing the implementation by version.
api_router = APIRouter(prefix="/api")
for router in (
    system.router,
    demo.router,
    state.router,
    transactions.router,
    goals.router,
    education.router,
    feedback.router,
):
    api_router.include_router(router)
