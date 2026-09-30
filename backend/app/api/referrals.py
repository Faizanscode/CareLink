from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.deps import get_current_active_user, RoleChecker
from app.models.referral import Referral as ReferralModel, ReferralActivity
from app.models.patient import Patient as PatientModel
from app.models.hospital import Hospital as HospitalModel
from app.models.user import User as UserModel
from app.schemas.referral import Referral, ReferralCreate, ReferralUpdate, ReferralDetail, ReferralListResponse, ReferralActivity as ReferralActivitySchema, RejectReferralRequest, RequestInformationRequest
from app.schemas.facility_matching import FacilityMatchResponse
from app.services.facility_matching import match_facilities

router = APIRouter()


@router.post("/referrals", response_model=Referral, status_code=status.HTTP_201_CREATED)
def create_referral(
    referral_in: ReferralCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = current_user
    
    # Determine referring hospital
    referring_hospital_id = None
    if user.role == "SUPER_ADMIN":
        if not referral_in.referring_hospital_id:
            raise HTTPException(status_code=400, detail="Super Admin must specify referring_hospital_id")
        referring_hospital_id = referral_in.referring_hospital_id
    else:
        if not user.hospital_id:
            raise HTTPException(status_code=403, detail="User not authorized or not associated with a hospital")
        referring_hospital_id = user.hospital_id

    referring_hospital = db.query(HospitalModel).filter(HospitalModel.id == referring_hospital_id).first()
    if not referring_hospital:
        raise HTTPException(status_code=404, detail="Referring hospital not found")
    
    # Validations
    patient = db.query(PatientModel).filter(PatientModel.id == referral_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    receiving_hospital = db.query(HospitalModel).filter(HospitalModel.id == referral_in.receiving_hospital_id).first()
    if not receiving_hospital:
        raise HTTPException(status_code=404, detail="Receiving hospital not found")

    # Generate referral code
    last_referral = db.query(ReferralModel).order_by(ReferralModel.id.desc()).first()
    next_id = (last_referral.id + 1) if last_referral else 1
    referral_code = f"REF-2026-{next_id:04d}"
    
    data = referral_in.model_dump(exclude={"referring_hospital_id"})
    
    db_referral = ReferralModel(
        **data,
        referral_code=referral_code,
        referring_hospital_id=referring_hospital_id,
        referring_user_id=user.id,
        status="DRAFT"
    )
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    
    # Log Activity
    activity = ReferralActivity(
        referral_id=db_referral.id,
        user_id=user.id,
        action="CREATED",
        to_status="DRAFT",
        comment="Referral draft created"
    )
    db.add(activity)
    db.commit()
    
    return db_referral

@router.get("/referrals", response_model=List[ReferralListResponse])
def get_referrals(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    referring_hospital_id: Optional[int] = None,
    receiving_hospital_id: Optional[int] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(ReferralModel)
    
    if current_user.role != "SUPER_ADMIN":
        from sqlalchemy import or_
        query = query.filter(or_(ReferralModel.referring_hospital_id == current_user.hospital_id, ReferralModel.receiving_hospital_id == current_user.hospital_id))
    
    if status:
        query = query.filter(ReferralModel.status == status)
    if priority:
        query = query.filter(ReferralModel.priority == priority)
    if referring_hospital_id:
        query = query.filter(ReferralModel.referring_hospital_id == referring_hospital_id)
    if receiving_hospital_id:
        query = query.filter(ReferralModel.receiving_hospital_id == receiving_hospital_id)
    if specialty:
        query = query.filter(ReferralModel.specialty == specialty)
        
    referrals = query.order_by(desc(ReferralModel.created_at)).all()
    
    results = []
    for r in referrals:
        results.append({
            "id": r.id,
            "referral_code": r.referral_code,
            "patient_code": r.patient.patient_code if r.patient else "Unknown",
            "specialty": r.specialty,
            "priority": r.priority,
            "status": r.status,
            "referring_hospital": r.referring_hospital.name if r.referring_hospital else "Unknown",
            "receiving_hospital": r.receiving_hospital.name if r.receiving_hospital else "Unknown",
            "created_at": r.created_at
        })
        
    return results

@router.get("/referrals/{referral_id}", response_model=ReferralDetail)
def get_referral(
    referral_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    if current_user.role != "SUPER_ADMIN":
        if referral.referring_hospital_id != current_user.hospital_id and referral.receiving_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this referral")
            
    return referral

@router.put("/referrals/{referral_id}", response_model=Referral)
def update_referral(
    referral_id: int, 
    referral_in: ReferralUpdate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if current_user.role != "SUPER_ADMIN" and db_referral.referring_hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this referral")
        
    if db_referral.status != "DRAFT":
        raise HTTPException(status_code=403, detail="Cannot edit a referral that is not in DRAFT status")
        
    update_data = referral_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_referral, key, value)
        
    db.commit()
    db.refresh(db_referral)
    return db_referral

# Workflow Endpoints
def _change_status(db: Session, referral_id: int, new_status: str, action: str, current_user: UserModel, comment: str = None, extra_updates: dict = None, require_referring: bool = False, require_receiving: bool = False):
    db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if current_user.role != "SUPER_ADMIN" and db_referral.referring_hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this referral")
        
    old_status = db_referral.status
    
    if current_user.role != "SUPER_ADMIN":
        if require_referring and db_referral.referring_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Only referring hospital can perform this action")
        if require_receiving and db_referral.receiving_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Only receiving hospital can perform this action")
    db_referral.status = new_status
    
    if extra_updates:
        for k, v in extra_updates.items():
            setattr(db_referral, k, v)
            
    db.commit()
    
    activity = ReferralActivity(
        referral_id=referral_id,
        user_id=current_user.id,
        action=action,
        from_status=old_status,
        to_status=new_status,
        comment=comment
    )
    db.add(activity)
    db.commit()
    
    db.refresh(db_referral)
    return db_referral

@router.post("/referrals/{referral_id}/submit", response_model=Referral)
def submit_referral(referral_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "DRAFT":
        raise HTTPException(status_code=400, detail="Only DRAFT referrals can be submitted")
        
    # Validation before submission
    if not all([ref.specialty, ref.reason_for_referral, ref.clinical_summary, ref.priority]):
        raise HTTPException(status_code=422, detail="Missing required clinical information for submission")
        
    return _change_status(
        db, referral_id, "SUBMITTED", "SUBMITTED", user_id, 
        comment="Referral submitted to receiving facility",
        extra_updates={"submitted_at": datetime.now(timezone.utc)}
    )

@router.post("/referrals/{referral_id}/review", response_model=Referral)
def review_referral(referral_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "SUBMITTED":
        raise HTTPException(status_code=400, detail="Invalid transition. Referral must be SUBMITTED")
        
    return _change_status(
        db, referral_id, "UNDER_REVIEW", "REVIEW_STARTED", user_id, 
        comment="Receiving facility started review"
    )

@router.post("/referrals/{referral_id}/accept", response_model=Referral)
def accept_referral(referral_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "UNDER_REVIEW":
        raise HTTPException(status_code=400, detail="Invalid transition. Referral must be UNDER_REVIEW")
        
    now = datetime.now(timezone.utc)
    return _change_status(
        db, referral_id, "ACCEPTED", "ACCEPTED", user_id, 
        comment="Referral accepted",
        extra_updates={
            "accepted_at": now,
            "reviewed_at": now,
            "receiving_user_id": user_id
        }
    )

@router.post("/referrals/{referral_id}/reject", response_model=Referral)
def reject_referral(referral_id: int, req: RejectReferralRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "UNDER_REVIEW":
        raise HTTPException(status_code=400, detail="Invalid transition. Referral must be UNDER_REVIEW")
        
    now = datetime.now(timezone.utc)
    return _change_status(
        db, referral_id, "REJECTED", "REJECTED", user_id, 
        comment=req.rejection_reason,
        extra_updates={
            "rejected_at": now,
            "reviewed_at": now,
            "rejection_reason": req.rejection_reason,
            "receiving_user_id": user_id
        }
    )

@router.post("/referrals/{referral_id}/request-information", response_model=Referral)
def request_information_referral(referral_id: int, req: RequestInformationRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "UNDER_REVIEW":
        raise HTTPException(status_code=400, detail="Invalid transition. Referral must be UNDER_REVIEW")
        
    now = datetime.now(timezone.utc)
    return _change_status(
        db, referral_id, "INFO_REQUESTED", "INFO_REQUESTED", user_id, 
        comment=req.message,
        extra_updates={
            "reviewed_at": now,
            "receiving_user_id": user_id
        }
    )

@router.post("/referrals/{referral_id}/cancel", response_model=Referral)
def cancel_referral(referral_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status not in ["DRAFT", "SUBMITTED"]:
        raise HTTPException(status_code=400, detail="Only DRAFT or SUBMITTED referrals can be cancelled")
        
    return _change_status(
        db, referral_id, "CANCELLED", "CANCELLED", user_id, 
        comment="Referral cancelled"
    )

@router.post("/referrals/{referral_id}/complete", response_model=Referral)
def complete_referral(referral_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref.status != "ACCEPTED":
        raise HTTPException(status_code=400, detail="Invalid transition. Referral must be ACCEPTED")
        
    return _change_status(
        db, referral_id, "COMPLETED", "COMPLETED", user_id, 
        comment="Referral completed"
    )

@router.get("/referrals/{referral_id}/history", response_model=List[ReferralActivitySchema])
def get_referral_history(referral_id: int, db: Session = Depends(get_db)):
    ref = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    return ref.activities

@router.get("/referrals/{referral_id}/matching-facilities", response_model=FacilityMatchResponse)
def get_matching_facilities(referral_id: int, limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    result = match_facilities(db, referral_id)
    if not result:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    # Apply limit
    result.matches = result.matches[:limit]
    return result
