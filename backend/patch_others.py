import re

def update_file(filename, replacements):
    with open(filename, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filename, 'w') as f:
        f.write(content)

# patients.py
patients_replacements = {
    'from fastapi import APIRouter, Depends, HTTPException, status': 'from fastapi import APIRouter, Depends, HTTPException, status\nfrom app.api.deps import get_current_active_user, RoleChecker\nfrom app.models.user import User as UserModel',
    'def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):': 'def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
    'def get_patient(patient_id: int, db: Session = Depends(get_db)):': 'def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
    'def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):': 'def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
    'def update_patient(patient_id: int, patient_in: PatientUpdate, db: Session = Depends(get_db)):': 'def update_patient(patient_id: int, patient_in: PatientUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
}
update_file('app/api/patients.py', patients_replacements)

# facilities.py
facilities_replacements = {
    'from fastapi import APIRouter, Depends, Query, HTTPException': 'from fastapi import APIRouter, Depends, Query, HTTPException\nfrom app.api.deps import get_current_active_user, RoleChecker\nfrom app.models.user import User as UserModel',
    'def get_specialties(db: Session = Depends(get_db)):': 'def get_specialties(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
    'def get_services(db: Session = Depends(get_db)):': 'def get_services(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):',
}
update_file('app/api/facilities.py', facilities_replacements)

# documents.py
with open('app/api/documents.py', 'r') as f:
    doc_content = f.read()

doc_content = re.sub(r'def get_current_user_id\(.*?\n\s+return x_user_id\n', '', doc_content, flags=re.DOTALL)
doc_content = doc_content.replace('from app.core.database import get_db', 'from app.core.database import get_db\nfrom app.api.deps import get_current_active_user')
doc_content = doc_content.replace('user_id: int = Depends(get_current_user_id)', 'current_user: UserModel = Depends(get_current_active_user)')
doc_content = doc_content.replace('user = db.query(UserModel).filter(UserModel.id == user_id).first()\n    if not user:\n        raise HTTPException(status_code=403, detail="User not found")\n', 'user = current_user\n')
doc_content = doc_content.replace('user = db.query(UserModel).filter(UserModel.id == user_id).first()\n    if not user:\n        raise HTTPException(status_code=403, detail="User not found")\n', 'user = current_user\n')

with open('app/api/documents.py', 'w') as f:
    f.write(doc_content)
