
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Configuración de la API
    app_name: str = "ChatBot de ayuda matematica"
    app_version: str = "1.0.0"
    
    # Configuración de RabbitMQ
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_exchange: str = "eventos"
    
    # Configuración de CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Configuración del servidor
    api_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instancia única de configuración
settings = Settings()