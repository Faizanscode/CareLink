import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.referral import Referral as ReferralModel, ReferralActivity
from app.models.document import Document as DocumentModel
from app.models.user import User as UserModel
from app.schemas.document import DocumentResponse

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB
ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"]
ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]


@router.post("/referrals/{referral_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    referral_id: int,
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = current_user
        
    referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    # Check authorization: user must be associated with referring or receiving hospital
    if user.hospital_id not in [referral.referring_hospital_id, referral.receiving_hospital_id]:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this referral")
        
    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, JPG, JPEG or PNG.")
        
    # Validate file size
    file.file.seek(0, 2) # Move to end of file
    file_size = file.file.tell() # Get current position
    file.file.seek(0) # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 10 MB limit.")
        
    # Generate unique filename
    unique_id = str(uuid.uuid4())
    stored_file_name = f"{unique_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_file_name)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to upload document.")
        
    # Generate document code
    last_doc = db.query(DocumentModel).order_by(DocumentModel.id.desc()).first()
    next_id = (last_doc.id + 1) if last_doc else 1
    document_code = f"DOC-2026-{next_id:04d}"
    
    # Create DB record
    db_document = DocumentModel(
        document_code=document_code,
        referral_id=referral.id,
        patient_id=referral.patient_id,
        uploaded_by=user.id,
        document_type=document_type,
        file_name=file.filename,
        stored_file_name=stored_file_name,
        file_path=file_path,
        mime_type=file.content_type,
        file_size=file_size,
        description=description,
        status="ACTIVE"
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Create Activity Log
    activity = ReferralActivity(
        referral_id=referral.id,
        user_id=user.id,
        action="DOCUMENT_UPLOADED",
        to_status=referral.status,
        comment=f"Document uploaded: {file.filename} ({document_type})"
    )
    db.add(activity)
    db.commit()
    
    return db_document

@router.get("/documents", response_model=List[DocumentResponse])
def list_all_documents(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = current_user
    
    # Get all documents for referrals where the user's hospital is involved
    documents = db.query(DocumentModel).join(ReferralModel).filter(
        DocumentModel.status == "ACTIVE",
        (ReferralModel.referring_hospital_id == user.hospital_id) |
        (ReferralModel.receiving_hospital_id == user.hospital_id)
    ).order_by(DocumentModel.uploaded_at.desc()).all()
    
    return documents

@router.get("/referrals/{referral_id}/documents", response_model=List[DocumentResponse])
def list_documents(
    referral_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if user.hospital_id not in [referral.referring_hospital_id, referral.receiving_hospital_id]:
        raise HTTPException(status_code=403, detail="You do not have permission to access these documents.")
        
    documents = db.query(DocumentModel).filter(
        DocumentModel.referral_id == referral_id,
        DocumentModel.status == "ACTIVE"
    ).all()
    
    return documents

@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document or document.status == "DELETED":
        raise HTTPException(status_code=404, detail="Document not found.")
        
    referral = document.referral
    if user.hospital_id not in [referral.referring_hospital_id, referral.receiving_hospital_id]:
        raise HTTPException(status_code=403, detail="You do not have permission to access this document.")
        
    return document

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document or document.status == "DELETED":
        raise HTTPException(status_code=404, detail="Document not found.")
        
    referral = document.referral
    if user.hospital_id not in [referral.referring_hospital_id, referral.receiving_hospital_id]:
        raise HTTPException(status_code=403, detail="You do not have permission to access this document.")
        
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server.")
        
    # Log Activity
    activity = ReferralActivity(
        referral_id=referral.id,
        user_id=user.id,
        action="DOCUMENT_ACCESSED",
        to_status=referral.status,
        comment=f"Document downloaded/accessed: {document.file_name}"
    )
    db.add(activity)
    db.commit()
        
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type
    )

@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document or document.status == "DELETED":
        raise HTTPException(status_code=404, detail="Document not found.")
        
    referral = document.referral
    
    # Rule: Once referral is SUBMITTED, UNDER_REVIEW, ACCEPTED, COMPLETED,
    # do not allow ordinary users to permanently remove clinical documents.
    # Rule: If referral status is DRAFT, referring user may delete documents they uploaded.
    if referral.status != "DRAFT":
        raise HTTPException(status_code=403, detail="Cannot delete documents once referral is submitted.")
        
    if user.id != document.uploaded_by:
        raise HTTPException(status_code=403, detail="You can only delete documents you uploaded.")
        
    document.status = "DELETED"
    db.commit()
    
    # Log Activity
    activity = ReferralActivity(
        referral_id=referral.id,
        user_id=user.id,
        action="DOCUMENT_DELETED",
        to_status=referral.status,
        comment=f"Document deleted: {document.file_name}"
    )
    db.add(activity)
    db.commit()
    
    return {"status": "success", "message": "Document deleted"}
