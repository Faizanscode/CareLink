const fs = require('fs');
const path = require('path');

const seedPy = `import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.hospital import Hospital
from app.models.capacity import HospitalCapacity
from app.models.facilities import Specialty, Service, Equipment
from app.models.user import User
from app.api.users import get_password_hash

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    specs = [
        "Cardiology", "Neurology", "Neurosurgery", "Orthopedics", "General Surgery", 
        "Trauma Care", "Pediatrics", "Nephrology", "Oncology", "Pulmonology", 
        "Gastroenterology", "Dermatology", "Gynecology", "Urology", "Critical Care"
    ]
    db_specs = []
    for s in specs:
        spec = Specialty(name=s)
        db.add(spec)
        db_specs.append(spec)
    
    servs = [
        "Emergency Care", "ICU", "NICU", "Blood Bank", "Dialysis", 
        "MRI", "CT Scan", "X-Ray", "Ultrasound", "Laboratory", 
        "Pharmacy", "Ambulance", "Operation Theatre", "Ventilator Support", "Trauma Care"
    ]
    db_servs = []
    for s in servs:
        srv = Service(name=s)
        db.add(srv)
        db_servs.append(srv)
        
    db.commit()

    now = datetime.now(timezone.utc)
    
    hospitals_data = [
        {
            "hospital_code": "CGH-001",
            "name": "City General Hospital",
            "registration_number": "REG-1001",
            "address": "100 Main St",
            "city": "Raipur",
            "state": "Chhattisgarh",
            "pincode": "492001",
            "latitude": 21.2514,
            "longitude": 81.6296,
            "phone": "9876543210",
            "email": "contact@citygeneral.com",
            "website": "www.citygeneral.com",
            "emergency_available": True,
            "operational_status": "Available",
            "last_capacity_update": now - timedelta(minutes=30), # fresh
            "capacity": HospitalCapacity(total_beds=200, available_beds=50, icu_total=20, icu_available=5, emergency_beds=30, emergency_available=10, ventilators_total=10, ventilators_available=2),
            "specialties": [db_specs[0], db_specs[1], db_specs[4]],
            "services": [db_servs[0], db_servs[1], db_servs[3]],
            "equipments": [Equipment(equipment_name="MRI", total_quantity=1, available_quantity=1, status="Working")]
        },
        {
            "hospital_code": "AMH-002",
            "name": "Apex Multispeciality Hospital",
            "registration_number": "REG-1002",
            "address": "200 VIP Rd",
            "city": "Bhilai",
            "state": "Chhattisgarh",
            "pincode": "490020",
            "latitude": 21.1938,
            "longitude": 81.3509,
            "phone": "9876543211",
            "email": "info@apex.com",
            "website": "www.apex.com",
            "emergency_available": True,
            "operational_status": "Limited Capacity",
            "last_capacity_update": now - timedelta(hours=3), # aging
            "capacity": HospitalCapacity(total_beds=150, available_beds=10, icu_total=15, icu_available=1, emergency_beds=20, emergency_available=2, ventilators_total=5, ventilators_available=0),
            "specialties": [db_specs[2], db_specs[3], db_specs[5]],
            "services": [db_servs[0], db_servs[1], db_servs[5]],
            "equipments": [Equipment(equipment_name="CT Scan", total_quantity=2, available_quantity=1, status="Working")]
        },
        {
            "hospital_code": "DH-003",
            "name": "District Hospital",
            "registration_number": "REG-1003",
            "address": "300 Civil Lines",
            "city": "Bilaspur",
            "state": "Chhattisgarh",
            "pincode": "495001",
            "latitude": 22.0797,
            "longitude": 82.1409,
            "phone": "9876543212",
            "email": "district@gov.in",
            "website": "www.districthosp.gov.in",
            "emergency_available": False,
            "operational_status": "Temporarily Unavailable",
            "last_capacity_update": now - timedelta(hours=10), # stale
            "capacity": HospitalCapacity(total_beds=100, available_beds=0, icu_total=10, icu_available=0, emergency_beds=15, emergency_available=0, ventilators_total=2, ventilators_available=0),
            "specialties": [db_specs[6], db_specs[7]],
            "services": [db_servs[4], db_servs[7]],
            "equipments": []
        },
        {
            "hospital_code": "MCH-004",
            "name": "Metro Care Hospital",
            "registration_number": "REG-1004",
            "address": "400 Ring Rd",
            "city": "Raipur",
            "state": "Chhattisgarh",
            "pincode": "492002",
            "latitude": 21.2614,
            "longitude": 81.6396,
            "phone": "9876543213",
            "email": "hello@metrocare.com",
            "website": "www.metrocare.com",
            "emergency_available": True,
            "operational_status": "Available",
            "last_capacity_update": now - timedelta(minutes=15), # fresh
            "capacity": HospitalCapacity(total_beds=250, available_beds=100, icu_total=30, icu_available=15, emergency_beds=40, emergency_available=25, ventilators_total=15, ventilators_available=10),
            "specialties": [db_specs[8], db_specs[9], db_specs[14]],
            "services": [db_servs[1], db_servs[2], db_servs[13]],
            "equipments": []
        },
        {
            "hospital_code": "CHC-005",
            "name": "Community Health Center",
            "registration_number": "REG-1005",
            "address": "500 Rural Rd",
            "city": "Durg",
            "state": "Chhattisgarh",
            "pincode": "491001",
            "latitude": 21.1904,
            "longitude": 81.2849,
            "phone": "9876543214",
            "email": "chc@health.in",
            "website": "www.chcdurg.in",
            "emergency_available": True,
            "operational_status": "Available",
            "last_capacity_update": now - timedelta(hours=4), # aging
            "capacity": HospitalCapacity(total_beds=50, available_beds=20, icu_total=0, icu_available=0, emergency_beds=5, emergency_available=5, ventilators_total=0, ventilators_available=0),
            "specialties": [db_specs[4], db_specs[12]],
            "services": [db_servs[0], db_servs[9], db_servs[10]],
            "equipments": []
        }
    ]

    for h_data in hospitals_data:
        h = Hospital(
            hospital_code=h_data["hospital_code"],
            name=h_data["name"],
            registration_number=h_data["registration_number"],
            description="A premium healthcare facility.",
            address=h_data["address"],
            city=h_data["city"],
            state=h_data["state"],
            pincode=h_data["pincode"],
            latitude=h_data["latitude"],
            longitude=h_data["longitude"],
            phone=h_data["phone"],
            email=h_data["email"],
            website=h_data["website"],
            emergency_available=h_data["emergency_available"],
            operational_status=h_data["operational_status"],
            last_capacity_update=h_data["last_capacity_update"]
        )
        h.capacity = h_data["capacity"]
        h.specialties.extend(h_data["specialties"])
        h.services.extend(h_data["services"])
        h.equipment.extend(h_data["equipments"])
        db.add(h)
        
    db.commit()

    # Create Users
    users = [
        User(name="Super Admin", email="admin@carelink.in", phone="1111111111", password_hash=get_password_hash("password"), role="SUPER_ADMIN"),
        User(name="Dr. Smith", email="smith@citygeneral.com", phone="2222222222", password_hash=get_password_hash("password"), role="HOSPITAL_ADMIN", hospital_id=1, department="Administration"),
        User(name="Dr. Patel", email="patel@apex.com", phone="3333333333", password_hash=get_password_hash("password"), role="DOCTOR", hospital_id=2, specialization="Neurology"),
        User(name="John Doe", email="coordinator@carelink.in", phone="4444444444", password_hash=get_password_hash("password"), role="COORDINATOR")
    ]
    for u in users:
        db.add(u)
        
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
`;

fs.writeFileSync(path.join(__dirname, 'seed.py'), seedPy, 'utf8');
console.log('Seed script generated.');
