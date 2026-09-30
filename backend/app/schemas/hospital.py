from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import List, Optional
from datetime import datetime, timezone

class NameObj(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class EquipmentBase(BaseModel):
    equipment_name: str
    total_quantity: int = 0
    available_quantity: int = 0
    status: str

class EquipmentResponse(EquipmentBase):
    id: int
    hospital_id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HospitalCapacityBase(BaseModel):
    total_beds: int = 0
    available_beds: int = 0
    icu_total: int = 0
    icu_available: int = 0
    emergency_beds: int = 0
    emergency_available: int = 0
    ventilators_total: int = 0
    ventilators_available: int = 0

    @model_validator(mode='after')
    def check_capacity(self):
        if self.available_beds > self.total_beds:
            raise ValueError('available_beds cannot exceed total_beds')
        if self.icu_available > self.icu_total:
            raise ValueError('icu_available cannot exceed icu_total')
        if self.emergency_available > self.emergency_beds:
            raise ValueError('emergency_available cannot exceed emergency_beds')
        if self.ventilators_available > self.ventilators_total:
            raise ValueError('ventilators_available cannot exceed ventilators_total')
        return self

class HospitalCapacityCreate(HospitalCapacityBase):
    pass

class HospitalCapacityResponse(HospitalCapacityBase):
    id: int
    hospital_id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HospitalBase(BaseModel):
    name: str
    hospital_code: str
    registration_number: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    emergency_available: bool = True
    operational_status: str = "Available"
    is_active: bool = True

class HospitalCreate(HospitalBase):
    specialties: List[int] = []
    services: List[int] = []
    capacity: Optional[HospitalCapacityCreate] = None

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    hospital_code: Optional[str] = None
    registration_number: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    emergency_available: Optional[bool] = None
    operational_status: Optional[str] = None
    is_active: Optional[bool] = None
    specialties: Optional[List[int]] = None
    services: Optional[List[int]] = None

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_capacity_update: Optional[datetime] = None
    capacity: Optional[HospitalCapacityResponse] = None
    specialties: List[NameObj] = []
    services: List[NameObj] = []
    equipment: List[EquipmentResponse] = []
    freshness: str = "stale"
    
    @model_validator(mode='after')
    def compute_freshness(self):
        # Calculate freshness
        if self.last_capacity_update:
            now = datetime.now(timezone.utc)
            delta = now - self.last_capacity_update.replace(tzinfo=timezone.utc)
            hours = delta.total_seconds() / 3600
            if hours < 1:
                self.freshness = "fresh"
            elif hours <= 6:
                self.freshness = "aging"
            else:
                self.freshness = "stale"
        else:
            self.freshness = "stale"
        return self
    
    model_config = ConfigDict(from_attributes=True)
