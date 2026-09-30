from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_active_user, RoleChecker
from app.models.user import User as UserModel
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.facilities import Specialty, Service
from app.schemas.hospital import NameObj

router = APIRouter()

@router.get("/specialties", response_model=List[NameObj])
def get_specialties(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    return db.query(Specialty).all()

@router.get("/services", response_model=List[NameObj])
def get_services(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    return db.query(Service).all()
