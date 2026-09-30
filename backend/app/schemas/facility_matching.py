from pydantic import BaseModel
from typing import List, Optional

class FacilityMatchResult(BaseModel):
    hospital_id: int
    hospital_name: str
    city: Optional[str] = None
    score: int
    match_level: str
    reasons: List[str]
    warnings: List[str]
    
    # Metadata for frontend rendering
    specialty_match: bool
    services_match: bool
    beds_available: int
    icu_available: int
    equipment_match: bool
    data_freshness_text: str

class FacilityMatchResponse(BaseModel):
    referral_id: int
    matches: List[FacilityMatchResult]
