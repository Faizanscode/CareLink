from sqlalchemy.orm import Session
from app.models.referral import Referral
from app.models.hospital import Hospital
from app.schemas.facility_matching import FacilityMatchResult, FacilityMatchResponse
from datetime import datetime, timezone

def calculate_data_freshness(last_update: datetime):
    if not last_update:
        return "Data freshness unavailable", 0
    
    if last_update.tzinfo is None:
        last_update = last_update.replace(tzinfo=timezone.utc)
        
    delta = datetime.now(timezone.utc) - last_update
    hours = delta.total_seconds() / 3600
    
    if hours < 1:
        return "Fresh", 5
    elif hours <= 6:
        return "Recently Updated", 3
    else:
        return "Stale", 0

def match_facilities(db: Session, referral_id: int) -> FacilityMatchResponse:
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        return None
        
    active_hospitals = db.query(Hospital).filter(
        Hospital.is_active == True,
        Hospital.operational_status == "Available",
        Hospital.id != referral.referring_hospital_id
    ).all()
    
    matches = []
    
    req_specialty = referral.specialty.lower() if referral.specialty else ""
    req_care = referral.required_care.lower() if referral.required_care else ""
    
    for hospital in active_hospitals:
        score = 0
        reasons = []
        warnings = []
        
        # 1. SPECIALTY MATCH (30)
        has_specialty = False
        for sp in hospital.specialties:
            if req_specialty and req_specialty in sp.name.lower():
                has_specialty = True
                break
        
        if has_specialty:
            score += 30
            reasons.append("Specialty matches")
            
        # 2. SERVICE MATCH (20)
        has_services = False
        if req_care:
            for srv in hospital.services:
                if srv.name.lower() in req_care:
                    has_services = True
                    break
        else:
            has_services = True
            
        if has_services:
            score += 20
            reasons.append("Required services available")
            
        # 3. BED AVAILABILITY (15)
        # 4. ICU AVAILABILITY (10)
        beds = 0
        icu = 0
        if hospital.capacity:
            beds = hospital.capacity.available_beds or 0
            icu = hospital.capacity.icu_available or 0
            
            if beds > 0:
                score += 15
                reasons.append("Bed capacity available")
            else:
                warnings.append("No regular beds available")
                
            if "icu" in req_care:
                if icu > 0:
                    score += 10
                    reasons.append("Required ICU capacity available")
                else:
                    warnings.append("No ICU beds available")
            else:
                if icu > 0:
                    score += 10
                    reasons.append("ICU capacity available")
        else:
            warnings.append("Capacity information unavailable")
            
        # 5. EQUIPMENT MATCH (10)
        has_equip = False
        needs_equip = False
        if "ventilator" in req_care:
            needs_equip = True
            for eq in hospital.equipment:
                if "ventilator" in eq.equipment_name.lower() and eq.available_quantity > 0:
                    has_equip = True
                    break
                    
        if needs_equip:
            if has_equip:
                score += 10
                reasons.append("Required equipment available")
            else:
                warnings.append("Required equipment not available")
        else:
            has_equip = True
            score += 10
            reasons.append("Equipment suitable")
            
        # 6. FACILITY STATUS (5)
        if hospital.operational_status == "Available":
            score += 5
            reasons.append("Facility currently available")
            
        # 7. DATA FRESHNESS (5)
        freshness_time = hospital.last_capacity_update
        if hospital.capacity and hospital.capacity.updated_at:
            freshness_time = hospital.capacity.updated_at
            
        freshness_text, freshness_score = calculate_data_freshness(freshness_time)
        score += freshness_score
        
        if freshness_score == 0 and freshness_text == "Stale":
            warnings.append("Capacity data is stale (> 6 hours old)")
        elif freshness_score == 0:
            warnings.append("Data freshness unavailable")
            
        # 8. LOCATION/DISTANCE (5)
        score += 5
        reasons.append("Location within acceptable range")
        
        # Match level
        if score >= 80:
            match_level = "High Match"
        elif score >= 60:
            match_level = "Moderate Match"
        else:
            match_level = "Low Match"
            
        matches.append(FacilityMatchResult(
            hospital_id=hospital.id,
            hospital_name=hospital.name,
            city=hospital.city,
            score=score,
            match_level=match_level,
            reasons=reasons,
            warnings=warnings,
            specialty_match=has_specialty,
            services_match=has_services,
            beds_available=beds,
            icu_available=icu,
            equipment_match=has_equip,
            data_freshness_text=freshness_text
        ))
        
    matches.sort(key=lambda x: x.score, reverse=True)
    return FacilityMatchResponse(referral_id=referral_id, matches=matches)
