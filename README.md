# CareLink
**Digital Patient Referral & Transfer Coordination**

## Project Overview
CareLink is a digital patient referral and hospital transfer coordination system designed to streamline healthcare operations. This repository contains the prototype for the system, currently implementing the Phase 1 foundational structure and UI shell.

## Current Phase
**Current implementation: Phase 6.5**
This phase includes the core project foundation, a responsive healthcare dashboard UI, navigation structure, referral tracking, smart matching, and role-based access control.

## Tech Stack
**Frontend:**
- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- React Router
- Lucide React

**Backend:**
- FastAPI (Python)
- SQLite (Configured for future phases)
- SQLAlchemy

## Project Structure
```text
/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   └── services/
│   └── requirements.txt (handled via pip install in documentation)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js (via @tailwindcss/vite)
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## How to Install

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Setup Frontend
```bash
cd frontend
npm install
```

### Setup Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy pydantic-settings
```

## How to Run

### Run Frontend
```bash
cd frontend
npm run dev
```
The frontend will be available at http://localhost:5173

### Run Backend
```bash
cd backend
# Make sure your virtual environment is activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API health check will be available at http://localhost:8000/api/health
Interactive API docs at http://localhost:8000/docs

## Environment Variables
Create a `.env` file in the `backend` directory based on the `.env.example` file.
```env
DATABASE_URL=sqlite:///./carelink.db
```
*Note: Do not commit `.env` to version control.*

## Future Phases
- **Phase 7**: Priority Engine
- **Phase 8**: Transfer Tracking
- **Phase 9**: Notifications & Communication
- **Phase 10**: Analytics, Data Freshness & Final Polish
