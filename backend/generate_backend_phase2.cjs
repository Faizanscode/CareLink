const fs = require('fs');
const path = require('path');

const files = {
  'app/models/facilities.py': `from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Specialty(Base):
    __tablename__ = "specialties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class HospitalSpecialty(Base):
    __tablename__ = "hospital_specialty"
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), primary_key=True)
    specialty_id = Column(Integer, ForeignKey("specialties.id"), primary_key=True)

class HospitalService(Base):
    __tablename__ = "hospital_service"
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), primary_key=True)

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    equipment_name = Column(String, index=True)
    total_quantity = Column(Integer, default=0)
    available_quantity = Column(Integer, default=0)
    status = Column(String)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    hospital = relationship("Hospital", back_populates="equipment")
`,

  'app/models/capacity.py': `from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class HospitalCapacity(Base):
    __tablename__ = "hospital_capacity"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), unique=True)
    
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    
    icu_total = Column(Integer, default=0)
    icu_available = Column(Integer, default=0)
    
    emergency_beds = Column(Integer, default=0)
    emergency_available = Column(Integer, default=0)
    
    ventilators_total = Column(Integer, default=0)
    ventilators_available = Column(Integer, default=0)
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    hospital = relationship("Hospital", back_populates="capacity")
`,

  'app/models/hospital.py': `from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    hospital_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    registration_number = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    # Location
    address = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Contact
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    # Status
    emergency_available = Column(Boolean, default=True)
    operational_status = Column(String, default="Available")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_capacity_update = Column(DateTime, nullable=True)
    
    # Relationships
    capacity = relationship("HospitalCapacity", back_populates="hospital", uselist=False, cascade="all, delete-orphan")
    users = relationship("User", back_populates="hospital")
    
    specialties = relationship("Specialty", secondary="hospital_specialty", backref="hospitals")
    services = relationship("Service", secondary="hospital_service", backref="hospitals")
    equipment = relationship("Equipment", back_populates="hospital", cascade="all, delete-orphan")
`,

  'app/models/user.py': `from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String)
    role = Column(String, default="COORDINATOR")
    is_active = Column(Boolean, default=True)
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    department = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    hospital = relationship("Hospital", back_populates="users")
`,

  'app/models/base.py': `from app.core.database import Base
from app.models.hospital import Hospital
from app.models.facilities import Specialty, Service, Equipment, HospitalSpecialty, HospitalService
from app.models.capacity import HospitalCapacity
from app.models.user import User
`,

  'app/schemas/hospital.py': `from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import List, Optional
from datetime import datetime, timezone

class NameObj(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class EquipmentBase(BaseModel):
    equipment_name: str
    total_quantity: int = 0
    available_quantity: int = 0
    status: str

class EquipmentResponse(EquipmentBase):
    id: int
    hospital_id: int
    updated_at: datetime
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
    id: int
    hospital_id: int
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
    specialties: List[int] = []
    services: List[int] = []
    capacity: Optional[HospitalCapacityCreate] = None

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    hospital_code: Optional[str] = None
    registration_number: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    emergency_available: Optional[bool] = None
    operational_status: Optional[str] = None
    is_active: Optional[bool] = None
    specialties: Optional[List[int]] = None
    services: Optional[List[int]] = None

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_capacity_update: Optional[datetime] = None
    capacity: Optional[HospitalCapacityResponse] = None
    specialties: List[NameObj] = []
    services: List[NameObj] = []
    equipment: List[EquipmentResponse] = []
    freshness: str = "stale"
    
    @model_validator(mode='after')
    def compute_freshness(self):
        # Calculate freshness
        if self.last_capacity_update:
            now = datetime.now(timezone.utc)
            delta = now - self.last_capacity_update.replace(tzinfo=timezone.utc)
            hours = delta.total_seconds() / 3600
            if hours < 1:
                self.freshness = "fresh"
            elif hours <= 6:
                self.freshness = "aging"
            else:
                self.freshness = "stale"
        else:
            self.freshness = "stale"
        return self
    
    model_config = ConfigDict(from_attributes=True)
`,

  'app/schemas/user.py': `from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "COORDINATOR"
    is_active: bool = True
    hospital_id: Optional[int] = None
    department: Optional[str] = None
    specialization: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    hospital_id: Optional[int] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
`,

  'app/api/hospitals.py': `from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.hospital import Hospital
from app.models.capacity import HospitalCapacity
from app.models.facilities import Specialty, Service
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse, HospitalCapacityBase

router = APIRouter()

@router.get("/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    q: Optional[str] = Query(None, description="Search term for name, code, or city"),
    city: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
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
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.post("/hospitals", response_model=HospitalResponse)
def create_hospital(hospital: HospitalCreate, db: Session = Depends(get_db)):
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
def update_hospital(hospital_id: int, hospital: HospitalUpdate, db: Session = Depends(get_db)):
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
def delete_hospital(hospital_id: int, db: Session = Depends(get_db)):
    db_hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not db_hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    db_hosp.is_active = False
    db.commit()
    return {"message": "Hospital deleted successfully"}

@router.get("/hospitals/{hospital_id}/capacity", response_model=HospitalCapacityResponse)
def get_capacity(hospital_id: int, db: Session = Depends(get_db)):
    db_hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not db_hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    if not db_hosp.capacity:
        raise HTTPException(status_code=404, detail="Capacity not found")
    return db_hosp.capacity

@router.put("/hospitals/{hospital_id}/capacity", response_model=HospitalCapacityResponse)
def update_capacity(hospital_id: int, capacity_data: HospitalCapacityBase, db: Session = Depends(get_db)):
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
`,

  'app/api/users.py': `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

def get_password_hash(password):
    return pwd_context.hash(password)

@router.get("/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user.password)
    user_data = user.model_dump(exclude={'password'})
    new_user = User(**user_data, password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user.model_dump(exclude_unset=True)
    if 'password' in update_data:
        db_user.password_hash = get_password_hash(update_data.pop('password'))
        
    for k, v in update_data.items():
        setattr(db_user, k, v)
        
    db_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.is_active = False
    db.commit()
    return {"message": "User deleted successfully"}
`,

  'app/api/facilities.py': `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.facilities import Specialty, Service
from app.schemas.hospital import NameObj

router = APIRouter()

@router.get("/specialties", response_model=List[NameObj])
def get_specialties(db: Session = Depends(get_db)):
    return db.query(Specialty).all()

@router.get("/services", response_model=List[NameObj])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()
`,

  'app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import health, hospitals, users, facilities

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareLink API Phase 2", version="2.0.0")

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
app.include_router(facilities.router, prefix="/api", tags=["Facilities"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CareLink API Phase 2"}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullpath = path.join(__dirname, filepath);
  const dir = path.dirname(fullpath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullpath, content, 'utf8');
}
console.log('Backend generated successfully.');
