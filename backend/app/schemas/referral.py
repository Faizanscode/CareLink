from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReferralBase(BaseModel):
    patient_id: int
    receiving_hospital_id: int
    specialty: str
    reason_for_referral: str
    clinical_summary: str
    diagnosis: Optional[str] = None
    current_condition: Optional[str] = None
    required_care: Optional[str] = None
    priority: str = "ROUTINE"

class ReferralCreate(ReferralBase):
    referring_hospital_id: Optional[int] = None

class ReferralUpdate(BaseModel):
    receiving_hospital_id: Optional[int] = None
    specialty: Optional[str] = None
    reason_for_referral: Optional[str] = None
    clinical_summary: Optional[str] = None
    diagnosis: Optional[str] = None
    current_condition: Optional[str] = None
    required_care: Optional[str] = None
    priority: Optional[str] = None

class RejectReferralRequest(BaseModel):
    rejection_reason: str

class RequestInformationRequest(BaseModel):
    message: str

class ReferralActivity(BaseModel):
    id: int
    referral_id: int
    user_id: Optional[int] = None
    action: str
    from_status: Optional[str] = None
    to_status: str
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Simple representations for nested relations
class PatientSummary(BaseModel):
    id: int
    patient_code: str
    first_name: str
    last_name: str
    
    class Config:
        from_attributes = True

class HospitalSummary(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    
    class Config:
        from_attributes = True

class Referral(ReferralBase):
    id: int
    referral_code: str
    referring_hospital_id: int
    referring_user_id: int
    receiving_user_id: Optional[int] = None
    status: str
    rejection_reason: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReferralDetail(Referral):
    patient: PatientSummary
    referring_hospital: HospitalSummary
    receiving_hospital: HospitalSummary
    activities: List[ReferralActivity] = []
    
    class Config:
        from_attributes = True

class ReferralListResponse(BaseModel):
    id: int
    referral_code: str
    patient_code: str
    specialty: str
    priority: str
    status: str
    referring_hospital: str
    receiving_hospital: str
    created_at: datetime
    
    class Config:
        from_attributes = True
