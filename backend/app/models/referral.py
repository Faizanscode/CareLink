from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referral_code = Column(String, unique=True, index=True)
    
    # Foreign Keys
    patient_id = Column(Integer, ForeignKey("patients.id"))
    referring_hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    receiving_hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    referring_user_id = Column(Integer, ForeignKey("users.id"))
    receiving_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Clinical Information
    specialty = Column(String)
    reason_for_referral = Column(String)
    clinical_summary = Column(String)
    diagnosis = Column(String, nullable=True)
    current_condition = Column(String, nullable=True)
    required_care = Column(String, nullable=True)
    
    # Workflow
    priority = Column(String, default="ROUTINE") # URGENT, HIGH, ROUTINE
    status = Column(String, default="DRAFT") # DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, CANCELLED, COMPLETED
    rejection_reason = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient")
    referring_hospital = relationship("Hospital", foreign_keys=[referring_hospital_id])
    receiving_hospital = relationship("Hospital", foreign_keys=[receiving_hospital_id])
    referring_user = relationship("User", foreign_keys=[referring_user_id])
    receiving_user = relationship("User", foreign_keys=[receiving_user_id])
    activities = relationship("ReferralActivity", back_populates="referral", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="referral", cascade="all, delete-orphan")


class ReferralActivity(Base):
    __tablename__ = "referral_activities"

    id = Column(Integer, primary_key=True, index=True)
    referral_id = Column(Integer, ForeignKey("referrals.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    action = Column(String)
    from_status = Column(String, nullable=True)
    to_status = Column(String)
    comment = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    referral = relationship("Referral", back_populates="activities")
    user = relationship("User")
