from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.hospital import Hospital
from app.models.capacity import HospitalCapacity
from app.models.facilities import Specialty, Service
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse, HospitalCapacityBase, HospitalCapacityResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.models.user import User

allow_admins = RoleChecker(["SUPER_ADMIN", "HOSPITAL_ADMIN"])
allow_super_admin = RoleChecker(["SUPER_ADMIN"])


router = APIRouter()

@router.get("/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    q: Optional[str] = Query(None, description="Search term for name, code, or city"),
    city: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Hospital).filter(Hospital.is_active == True)
    
    if q:
        search = f"%{q}%"
        query = query.filter(
            (Hospital.name.ilike(search)) |
            (Hospital.hospital_code.ilike(search)) |
            (Hospital.city.ilike(search)) |
            (Hospital.state.ilike(search))
        )
    if city:
        query = query.filter(Hospital.city == city)
    if state:
        query = query.filter(Hospital.state == state)
    if status and status != "All":
        query = query.filter(Hospital.operational_status == status)
        
    return query.all()

@router.get("/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital(
    hospital_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.post("/hospitals", response_model=HospitalResponse)
def create_hospital(
    hospital: HospitalCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_super_admin)
):
    db_hosp = db.query(Hospital).filter(Hospital.hospital_code == hospital.hospital_code).first()
    if db_hosp:
        raise HTTPException(status_code=400, detail="Hospital code already exists")
    
    hosp_dict = hospital.model_dump(exclude={'specialties', 'services', 'capacity'})
    new_hosp = Hospital(**hosp_dict)
    
    if hospital.specialties:
        specs = db.query(Specialty).filter(Specialty.id.in_(hospital.specialties)).all()
        new_hosp.specialties.extend(specs)
        
    if hospital.services:
        srvs = db.query(Service).filter(Service.id.in_(hospital.services)).all()
        new_hosp.services.extend(srvs)
        
    if hospital.capacity:
        cap_dict = hospital.capacity.model_dump()
        new_hosp.capacity = HospitalCapacity(**cap_dict)
        new_hosp.last_capacity_update = datetime.now(timezone.utc)
    
    db.add(new_hosp)
    db.commit()
    db.refresh(new_hosp)
    return new_hosp

@router.put("/hospitals/{hospital_id}", response_model=HospitalResponse)
def update_hospital(
    hospital_id: int, 
    hospital: HospitalUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    if current_user.role == "HOSPITAL_ADMIN" and current_user.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this hospital")

    db_hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not db_hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    update_data = hospital.model_dump(exclude_unset=True, exclude={'specialties', 'services'})
    for k, v in update_data.items():
        setattr(db_hosp, k, v)
        
    if hospital.specialties is not None:
        db_hosp.specialties.clear()
        specs = db.query(Specialty).filter(Specialty.id.in_(hospital.specialties)).all()
        db_hosp.specialties.extend(specs)
        
    if hospital.services is not None:
        db_hosp.services.clear()
        srvs = db.query(Service).filter(Service.id.in_(hospital.services)).all()
        db_hosp.services.extend(srvs)
        
    db_hosp.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_hosp)
    return db_hosp

@router.delete("/hospitals/{hospital_id}")
def delete_hospital(
    hospital_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_super_admin)
):
    db_hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not db_hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    db_hosp.is_active = False
    db.commit()
    return {"message": "Hospital deleted successfully"}

@router.get("/hospitals/{hospital_id}/capacity", response_model=HospitalCapacityResponse)
def get_capacity(
    hospital_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not db_hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    if not db_hosp.capacity:
        raise HTTPException(status_code=404, detail="Capacity not found")
    return db_hosp.capacity

@router.put("/hospitals/{hospital_id}/capacity", response_model=HospitalCapacityResponse)
def update_capacity(
    hospital_id: int, 
    capacity_data: HospitalCapacityBase, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    if current_user.role == "HOSPITAL_ADMIN" and current_user.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this hospital's capacity")

    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    if not hospital.capacity:
        hospital.capacity = HospitalCapacity(hospital_id=hospital_id)
        
    for key, value in capacity_data.model_dump().items():
        setattr(hospital.capacity, key, value)
        
    now = datetime.now(timezone.utc)
    hospital.capacity.updated_at = now
    hospital.last_capacity_update = now
    
    db.commit()
    db.refresh(hospital)
    return hospital.capacity
