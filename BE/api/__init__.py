from fastapi import APIRouter
from .endpoint import router


api_router = APIRouter()
api_router.include_router(router)