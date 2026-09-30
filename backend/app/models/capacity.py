from sqlalchemy import Column, Integer, ForeignKey, DateTime
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
