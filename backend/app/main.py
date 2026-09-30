from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import health, hospitals, users, facilities
from app.models.patient import Patient
from app.models.referral import Referral, ReferralActivity
from app.models.document import Document

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareLink API Phase 2", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(hospitals.router, prefix="/api", tags=["Hospitals"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(facilities.router, prefix="/api", tags=["Facilities"])
from app.api import patients, referrals, documents, auth
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(referrals.router, prefix="/api", tags=["Referrals"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CareLink API Phase 2"}
