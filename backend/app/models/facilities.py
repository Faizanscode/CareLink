from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
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
