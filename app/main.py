from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import math_router
from app.config import settings

# Creación de la instancia de FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version
)

app.include_router(
    math_router.router,
    prefix="/api/v1"
)



# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(
    math_router.router, 
    prefix=settings.api_prefix, 
    tags=["mathematics"]
)

# (health check)
@app.get("/")
async def root():
    return {
        "message": "Math Chatbot API",
        "status": "running",
        "version": settings.app_version,
        "docs": "/docs"
    }
