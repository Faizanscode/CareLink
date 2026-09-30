from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user, RoleChecker
from app.models.user import User as UserModel
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.patient import Patient as PatientModel
from app.schemas.patient import Patient, PatientCreate, PatientUpdate

router = APIRouter()

@router.post("/patients", response_model=Patient, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Generate unique patient code
    last_patient = db.query(PatientModel).order_by(PatientModel.id.desc()).first()
    next_id = (last_patient.id + 1) if last_patient else 1
    # Simple code generator for prototype
    patient_code = f"PAT-2026-{next_id:04d}"
    
    db_patient = PatientModel(
        **patient_in.model_dump(),
        patient_code=patient_code
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/patients", response_model=List[Patient])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    patients = db.query(PatientModel).offset(skip).limit(limit).all()
    return patients

@router.get("/patients/{patient_id}", response_model=Patient)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/patients/{patient_id}", response_model=Patient)
def update_patient(patient_id: int, patient_in: PatientUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)
        
    db.commit()
    db.refresh(db_patient)
    return db_patient
