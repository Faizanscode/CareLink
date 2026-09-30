import sys
import os

# Add the backend dir to sys.path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import engine, Base, SessionLocal
from app import main # this ensures all models are imported correctly
from app.models.patient import Patient
from app.models.referral import Referral, ReferralActivity
from app.models.hospital import Hospital
from app.models.user import User
from datetime import datetime, timezone

def create_tables_and_seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
    
    db = SessionLocal()
    
    # Check if hospitals exist, if not, wait (assumes Phase 2 data exists)
    hospitals = db.query(Hospital).all()
    if len(hospitals) < 2:
        print("Not enough hospitals to create referrals. Creating mock hospitals...")
        h1 = Hospital(hospital_code="HOSP-001", name="City General Hospital", city="New York")
        h2 = Hospital(hospital_code="HOSP-002", name="Apex Multispeciality Hospital", city="New York")
        db.add_all([h1, h2])
        db.commit()
        db.refresh(h1)
        db.refresh(h2)
    else:
        h1, h2 = hospitals[0], hospitals[1]
        
    users = db.query(User).all()
    if not users:
        print("No users found. Creating mock user...")
        u1 = User(name="Dr. Smith", email="smith@citygeneral.com", password_hash="dummy", hospital_id=h1.id)
        u2 = User(name="Dr. Jones", email="jones@apex.com", password_hash="dummy", hospital_id=h2.id)
        db.add_all([u1, u2])
        db.commit()
        db.refresh(u1)
        db.refresh(u2)
    else:
        u1 = users[0]
        # ensure second user
        u2 = users[1] if len(users) > 1 else users[0]

    print("Checking for patients...")
    if not db.query(Patient).first():
        p = Patient(
            patient_code="PAT-2026-0001",
            first_name="Aarav",
            last_name="Mehta",
            date_of_birth="1980-05-15",
            gender="Male",
            phone="555-0100",
            blood_group="O+",
            city="New York"
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        
        r1 = Referral(
            referral_code="REF-2026-0001",
            patient_id=p.id,
            referring_hospital_id=h1.id,
            receiving_hospital_id=h2.id,
            referring_user_id=u1.id,
            specialty="Cardiology",
            reason_for_referral="Patient requires higher-level cardiac evaluation.",
            clinical_summary="Chest pain for 3 days.",
            priority="URGENT",
            status="SUBMITTED",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(r1)
        db.commit()
        
        a1 = ReferralActivity(
            referral_id=r1.id,
            user_id=u1.id,
            action="SUBMITTED",
            from_status="DRAFT",
            to_status="SUBMITTED",
            comment="Initial submission"
        )
        db.add(a1)
        db.commit()
        print("Demo data created successfully.")
    else:
        print("Demo data already exists.")
        
    db.close()

if __name__ == "__main__":
    create_tables_and_seed()
