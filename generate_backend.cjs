const fs = require('fs');
const path = require('path');

const files = {
  'backend/app/core/config.py': `import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareLink API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./carelink.db")
    
settings = Settings()
`,

  'backend/app/core/database.py': `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`,

  'backend/app/models/base.py': `from app.core.database import Base

# Import all models here so Alembic can discover them
from app.models.hospital import Hospital
`,

  'backend/app/models/hospital.py': `from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    status = Column(String)
    is_active = Column(Boolean, default=True)
`,
  'backend/app/schemas/hospital.py': `from pydantic import BaseModel

class HospitalBase(BaseModel):
    name: str
    location: str
    status: str
    is_active: bool = True

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: int

    class Config:
        from_attributes = True
`,

  'backend/app/api/health.py': `from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "carelink-api"}
`,
  'backend/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import health

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareLink API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CareLink API"}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf8');
}
console.log('Backend generated successfully.');
