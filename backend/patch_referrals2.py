import re

with open('app/api/referrals.py', 'r') as f:
    content = f.read()

# Helper function to enforce auth
auth_helper = """
def enforce_referral_access(db: Session, referral_id: int, current_user: UserModel, require_referring: bool = False, require_receiving: bool = False):
    if current_user.role == "SUPER_ADMIN":
        return db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
        
    referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if require_referring and referral.referring_hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Must be referring hospital")
        
    if require_receiving and referral.receiving_hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Must be receiving hospital")
        
    if not require_referring and not require_receiving:
        if referral.referring_hospital_id != current_user.hospital_id and referral.receiving_hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this referral")
            
    return referral

"""

if "def enforce_referral_access" not in content:
    content = content.replace('def _change_status', auth_helper + 'def _change_status')

content = content.replace('db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()', 'db_referral = enforce_referral_access(db, referral_id, current_user, require_referring=True)')
# wait, update_referral is referring hospital only.
# submit_referral is referring hospital only.
# cancel_referral is referring hospital only.

# Let's write a targeted script to replace them specifically.
