from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
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
