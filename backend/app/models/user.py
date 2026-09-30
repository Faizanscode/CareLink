from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
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
