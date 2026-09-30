const fs = require('fs');
const path = require('path');

const files = {
  'backend/app/schemas/hospital.py': `from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import List, Optional
from datetime import datetime

class NameObj(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class HospitalCapacityBase(BaseModel):
    total_beds: int = 0
    available_beds: int = 0
    icu_total: int = 0
    icu_available: int = 0
    emergency_beds: int = 0
    emergency_available: int = 0
    ventilators_total: int = 0
    ventilators_available: int = 0

    @model_validator(mode='after')
    def check_capacity(self):
        if self.available_beds > self.total_beds:
            raise ValueError('available_beds cannot exceed total_beds')
        if self.icu_available > self.icu_total:
            raise ValueError('icu_available cannot exceed icu_total')
        if self.emergency_available > self.emergency_beds:
            raise ValueError('emergency_available cannot exceed emergency_beds')
        if self.ventilators_available > self.ventilators_total:
            raise ValueError('ventilators_available cannot exceed ventilators_total')
        return self

class HospitalCapacityCreate(HospitalCapacityBase):
    pass

class HospitalCapacityResponse(HospitalCapacityBase):
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HospitalBase(BaseModel):
    name: str
    hospital_code: str
    registration_number: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    emergency_available: bool = True
    operational_status: str = "Available"
    is_active: bool = True

class HospitalCreate(HospitalBase):
    capacity: Optional[HospitalCapacityCreate] = None
    specialties: List[str] = []
    services: List[str] = []
    equipment: List[str] = []

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    capacity: Optional[HospitalCapacityResponse] = None
    specialties: List[NameObj] = []
    services: List[NameObj] = []
    equipment: List[NameObj] = []
    model_config = ConfigDict(from_attributes=True)
`,

  'backend/app/schemas/user.py': `from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "COORDINATOR"
    is_active: bool = True
    hospital_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
`,

  'backend/app/api/hospitals.py': `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.hospital import Hospital
from app.models.capacity import HospitalCapacity
from app.models.facilities import Specialty, Service, Equipment
from app.schemas.hospital import HospitalCreate, HospitalResponse, HospitalCapacityBase

router = APIRouter()

@router.get("/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    skip: int = 0, limit: int = 100,
    city: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hospital).filter(Hospital.is_active == True)
    if city:
        query = query.filter(Hospital.city == city)
    if status:
        query = query.filter(Hospital.operational_status == status)
        
    return query.offset(skip).limit(limit).all()

@router.get("/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.put("/hospitals/{hospital_id}/capacity", response_model=HospitalResponse)
def update_capacity(hospital_id: int, capacity_data: HospitalCapacityBase, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    if not hospital.capacity:
        hospital.capacity = HospitalCapacity(hospital_id=hospital_id)
        
    for key, value in capacity_data.model_dump().items():
        setattr(hospital.capacity, key, value)
        
    db.commit()
    db.refresh(hospital)
    return hospital
`,

  'backend/app/api/users.py': `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Mock password hashing for Phase 2
    hashed_pwd = user.password + "notreallyhashed"
    
    new_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        role=user.role,
        hospital_id=user.hospital_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
`,

  'backend/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import health, hospitals, users

# This will create tables for all models imported in app.models.base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareLink API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(hospitals.router, prefix="/api", tags=["Hospitals"])
app.include_router(users.router, prefix="/api", tags=["Users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CareLink API Phase 2"}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf8');
}
console.log('Schemas and API routes generated successfully.');
