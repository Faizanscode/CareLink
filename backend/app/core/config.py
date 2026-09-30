import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareLink API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./carelink.db")
    
settings = Settings()
