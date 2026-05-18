# Smart Emergency Response & Ambulance Dispatch System

AI-powered emergency healthcare coordination — FastAPI + PostgreSQL + React + Tailwind.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | FastAPI, SQLAlchemy, Alembic        |
| Database   | PostgreSQL                          |
| Queue      | Redis + Celery                      |
| Auth       | JWT (python-jose + passlib/bcrypt)  |
| Frontend   | React 18, Vite, Tailwind CSS        |
| DevOps     | Docker, Docker Compose              |

---

## Project Structure (Phase 1)

```
smart-emergency/
├── main.py                         # FastAPI app entry point
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example                    # Copy to .env and fill in values
├── alembic/                        # DB migrations
│   └── env.py
├── app/
│   ├── config.py                   # Pydantic settings
│   ├── database.py                 # SQLAlchemy engine + session
│   ├── dependencies.py             # Auth dependencies (JWT)
│   ├── models/                     # ORM models
│   │   ├── user.py
│   │   ├── ambulance.py
│   │   ├── hospital.py
│   │   ├── emergency_request.py
│   │   ├── dispatch_log.py
│   │   ├── notification.py
│   │   └── route.py
│   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── user.py
│   │   ├── ambulance.py
│   │   ├── emergency.py
│   │   └── hospital.py
│   ├── routers/                    # API endpoints
│   │   ├── auth.py                 # POST /register, /login, /me
│   │   ├── ambulances.py           # CRUD + GPS location update
│   │   ├── emergency.py            # Create + list + status update
│   │   ├── hospitals.py            # CRUD + bed count update
│   │   ├── tracking.py             # REST + WebSocket live tracking
│   │   └── analytics.py            # Summary stats
│   ├── services/
│   │   ├── auth_service.py         # JWT + bcrypt helpers
│   │   └── dispatch_service.py     # AI dispatch algorithm
│   ├── tasks/
│   │   ├── celery_app.py
│   │   └── dispatch_tasks.py
│   └── utils/
│       ├── geo.py                  # Haversine distance
│       └── logger.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_emergency.py
└── frontend/                       # React + Vite + Tailwind
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                 # Routing
        ├── main.jsx
        ├── index.css               # Tailwind + custom classes
        ├── api/
        │   ├── client.js           # Axios instance with JWT interceptor
        │   └── endpoints.js        # All API call functions
        ├── context/
        │   └── AuthContext.jsx     # Global auth state
        ├── hooks/
        │   ├── useEmergencies.js
        │   ├── useAmbulances.js
        │   └── useAnalytics.js
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── StatCard.jsx
        │   ├── SeverityBadge.jsx
        │   ├── StatusBadge.jsx
        │   ├── Spinner.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Emergencies.jsx
        │   ├── Ambulances.jsx
        │   ├── Hospitals.jsx
        │   └── Analytics.jsx
        └── utils/
            └── format.js
```

---

## Quick Start

### 1. Clone & configure

```bash
git clone <your-repo>
cd smart-emergency
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, REDIS_URL
```

### 2. Run with Docker (recommended)

```bash
docker-compose up --build
```

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### 3. Run locally (without Docker)

**Backend:**
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Make sure PostgreSQL and Redis are running
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Run DB migrations (production)

```bash
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

### 5. Run tests

```bash
pip install pytest httpx
pytest tests/ -v
```

---

## API Endpoints (Phase 1)

| Method | Endpoint                          | Description                    | Auth         |
|--------|-----------------------------------|--------------------------------|--------------|
| POST   | /api/auth/register                | Create account                 | Public       |
| POST   | /api/auth/login                   | Get JWT token                  | Public       |
| GET    | /api/auth/me                      | Current user info              | Any role     |
| POST   | /api/emergency/                   | Create emergency + auto-dispatch | Any role   |
| GET    | /api/emergency/                   | List all emergencies           | Admin/Dispatcher |
| GET    | /api/emergency/{id}               | Get single emergency           | Any role     |
| PATCH  | /api/emergency/{id}/status        | Update status                  | Staff        |
| GET    | /api/ambulances/                  | List ambulances                | Any role     |
| POST   | /api/ambulances/                  | Register ambulance             | Admin        |
| PATCH  | /api/ambulances/{id}/location     | GPS ping (driver)              | Any role     |
| PATCH  | /api/ambulances/{id}/status       | Change ambulance status        | Staff        |
| GET    | /api/hospitals/                   | List hospitals                 | Any role     |
| POST   | /api/hospitals/                   | Register hospital              | Admin        |
| GET    | /api/hospitals/nearest            | Nearest with beds (?lat&lng)   | Any role     |
| PATCH  | /api/hospitals/{id}/beds          | Update bed count               | Staff        |
| GET    | /api/tracking/{emergency_id}      | Get live tracking snapshot     | Any role     |
| WS     | /api/tracking/ws/{emergency_id}   | WebSocket live tracking        | Public       |
| GET    | /api/analytics/summary            | Dashboard stats                | Admin/Dispatcher |

---

## Phase 2 (Coming Next)

- [ ] Google Maps route + ETA integration
- [ ] Twilio SMS notifications
- [ ] Driver mobile app GPS auto-ping
- [ ] Real map view (Leaflet.js) in dashboard
- [ ] Per-emergency dispatch timeline
- [ ] Historical trend charts
- [ ] IoT health monitoring integration

