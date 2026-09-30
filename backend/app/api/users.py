from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter()

allow_admins = RoleChecker(["SUPER_ADMIN", "HOSPITAL_ADMIN"])

@router.get("/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    query = db.query(User)
    if current_user.role == "HOSPITAL_ADMIN":
        query = query.filter(User.hospital_id == current_user.hospital_id)
    return query.offset(skip).limit(limit).all()

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.role == "HOSPITAL_ADMIN" and db_user.hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
        
    return db_user

@router.post("/users", response_model=UserResponse)
def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    if current_user.role == "HOSPITAL_ADMIN":
        if user.hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Can only create users for your own hospital")
        if user.role == "SUPER_ADMIN":
            raise HTTPException(status_code=403, detail="Hospital admins cannot create super admins")
            
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user.password)
    user_data = user.model_dump(exclude={'password'})
    new_user = User(**user_data, password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    user: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "HOSPITAL_ADMIN":
        if db_user.hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this user")
        if user.hospital_id is not None and user.hospital_id != current_user.hospital_id:
            raise HTTPException(status_code=403, detail="Cannot move user to another hospital")
        if user.role == "SUPER_ADMIN":
            raise HTTPException(status_code=403, detail="Hospital admins cannot grant super admin role")
        
    update_data = user.model_dump(exclude_unset=True)
    if 'password' in update_data:
        db_user.password_hash = get_password_hash(update_data.pop('password'))
        
    for k, v in update_data.items():
        setattr(db_user, k, v)
        
    db_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "HOSPITAL_ADMIN" and db_user.hospital_id != current_user.hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
        
    db_user.is_active = False
    db.commit()
    return {"message": "User deleted successfully"}
