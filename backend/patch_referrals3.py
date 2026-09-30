import re

with open('app/api/referrals.py', 'r') as f:
    content = f.read()

# Replace db_referral fetch in update_referral
replace_from = """    db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")"""

replace_to = """    db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if current_user.role != "SUPER_ADMIN" and db_referral.referring_hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this referral")"""

content = content.replace(replace_from, replace_to)

# Update _change_status
old_sig = 'def _change_status(db: Session, referral_id: int, new_status: str, action: str, user_id: int, comment: str = None, extra_updates: dict = None):'
new_sig = 'def _change_status(db: Session, referral_id: int, new_status: str, action: str, current_user: UserModel, comment: str = None, extra_updates: dict = None, require_referring: bool = False, require_receiving: bool = False):'

content = content.replace(old_sig, new_sig)

# Inside _change_status add auth
auth_code = """    old_status = db_referral.status
    
    if current_user.role != "SUPER_ADMIN":
        if require_referring and db_referral.referring_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Only referring hospital can perform this action")
        if require_receiving and db_referral.receiving_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Only receiving hospital can perform this action")"""

content = content.replace('    old_status = db_referral.status', auth_code)
content = content.replace('user_id=user_id,', 'user_id=current_user.id,')

# Now update the callers of _change_status
content = content.replace(
    'return _change_status(db, referral_id, "SUBMITTED", "SUBMITTED", current_user.id)',
    'return _change_status(db, referral_id, "SUBMITTED", "SUBMITTED", current_user, require_referring=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "CANCELLED", "CANCELLED", current_user.id)',
    'return _change_status(db, referral_id, "CANCELLED", "CANCELLED", current_user, require_referring=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "UNDER_REVIEW", "REVIEW_STARTED", current_user.id)',
    'return _change_status(db, referral_id, "UNDER_REVIEW", "REVIEW_STARTED", current_user, require_receiving=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "ACCEPTED", "ACCEPTED", current_user.id)',
    'return _change_status(db, referral_id, "ACCEPTED", "ACCEPTED", current_user, require_receiving=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "REJECTED", "REJECTED", current_user.id, request.reason, {"rejection_reason": request.reason})',
    'return _change_status(db, referral_id, "REJECTED", "REJECTED", current_user, request.reason, {"rejection_reason": request.reason}, require_receiving=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "INFO_REQUESTED", "INFO_REQUESTED", current_user.id, request.message)',
    'return _change_status(db, referral_id, "INFO_REQUESTED", "INFO_REQUESTED", current_user, request.message, None, require_receiving=True)'
)
content = content.replace(
    'return _change_status(db, referral_id, "TRANSFER_COMPLETED", "TRANSFER_COMPLETED", current_user.id)',
    'return _change_status(db, referral_id, "TRANSFER_COMPLETED", "TRANSFER_COMPLETED", current_user, require_receiving=True)'
)

with open('app/api/referrals.py', 'w') as f:
    f.write(content)
