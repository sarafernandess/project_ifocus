from fastapi import APIRouter
from app.routes.course_routes import router as course_router
from app.routes.discipline_routes import router as discipline_router
from app.routes.user_routes import router as user_router, helpers_router, public_router
from app.routes.chat_routes import router as chat_router

api_router = APIRouter()

api_router.include_router(user_router)
api_router.include_router(course_router)
api_router.include_router(discipline_router)
api_router.include_router(chat_router, prefix="")
api_router.include_router(helpers_router)
api_router.include_router(public_router)