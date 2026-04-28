from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from app.api.router import api_router
from app.core.exceptions import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.db.pool import close_db_pool, init_db_pool

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Open the database pool once for the app process, then close it on shutdown.
    init_db_pool()
    yield
    close_db_pool()


app = FastAPI(title="Online Survey Service", version="0.1.0", lifespan=lifespan)
# All public backend endpoints are grouped under /api.
app.include_router(api_router, prefix="/api")
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
