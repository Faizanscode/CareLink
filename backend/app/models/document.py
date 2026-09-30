from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_code = Column(String(50), unique=True, index=True, nullable=False)
    
    referral_id = Column(Integer, ForeignKey("referrals.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    document_type = Column(String(50), nullable=False)  # MEDICAL_REPORT, LAB_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, IMAGING_REPORT, OTHER
    
    file_name = Column(String(255), nullable=False)
    stored_file_name = Column(String(255), nullable=False, unique=True)
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # size in bytes
    
    description = Column(Text, nullable=True)
    
    status = Column(String(50), nullable=False, default="ACTIVE")  # ACTIVE, DELETED
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    referral = relationship("Referral", back_populates="documents")
    patient = relationship("Patient")
    uploader = relationship("User")
