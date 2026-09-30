from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    document_type: str
    description: Optional[str] = None

class DocumentPatientSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    patient_code: str
    
    class Config:
        from_attributes = True

class DocumentReferralSummary(BaseModel):
    id: int
    referral_code: str
    
    class Config:
        from_attributes = True

class DocumentUserSummary(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class DocumentResponse(DocumentBase):
    id: int
    document_code: str
    referral_id: int
    patient_id: int
    uploaded_by: int
    file_name: str
    mime_type: str
    file_size: int
    status: str
    uploaded_at: datetime
    updated_at: datetime
    
    patient: Optional[DocumentPatientSummary] = None
    referral: Optional[DocumentReferralSummary] = None
    uploader: Optional[DocumentUserSummary] = None

    class Config:
        from_attributes = True
