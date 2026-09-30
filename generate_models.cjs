const fs = require('fs');
const path = require('path');

const files = {
  'backend/app/models/facilities.py': `from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Specialty(Base):
    __tablename__ = "specialties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Equipment(Base):
    __tablename__ = "equipment"
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

class HospitalEquipment(Base):
    __tablename__ = "hospital_equipment"
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), primary_key=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), primary_key=True)
`,

  'backend/app/models/capacity.py': `from sqlalchemy import Column, Integer, ForeignKey, DateTime
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

  'backend/app/models/hospital.py': `from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    hospital_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    registration_number = Column(String)
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
    operational_status = Column(String, default="Available") # e.g. Available, Limited Capacity, Data Needs Update
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    capacity = relationship("HospitalCapacity", back_populates="hospital", uselist=False, cascade="all, delete-orphan")
    users = relationship("User", back_populates="hospital")
    
    specialties = relationship("Specialty", secondary="hospital_specialty", backref="hospitals")
    services = relationship("Service", secondary="hospital_service", backref="hospitals")
    equipment = relationship("Equipment", secondary="hospital_equipment", backref="hospitals")
`,

  'backend/app/models/user.py': `from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="COORDINATOR") # ADMIN, COORDINATOR, HOSPITAL_ADMIN
    is_active = Column(Boolean, default=True)
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    hospital = relationship("Hospital", back_populates="users")
`,

  'backend/app/models/base.py': `from app.core.database import Base

# Import all models here so Alembic/SQLAlchemy can discover them
from app.models.hospital import Hospital
from app.models.facilities import Specialty, Service, Equipment, HospitalSpecialty, HospitalService, HospitalEquipment
from app.models.capacity import HospitalCapacity
from app.models.user import User
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf8');
}
console.log('Models generated successfully.');
