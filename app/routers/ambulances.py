from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.database import get_db
from app.models.ambulance import Ambulance
from app.models.user import UserRole
from app.schemas.ambulance import AmbulanceCreate, AmbulanceOut, AmbulanceLocationUpdate, AmbulanceStatusUpdate
from app.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/ambulances", tags=["Ambulances"])


@router.post("/", response_model=AmbulanceOut, status_code=201)
def create_ambulance(
    payload: AmbulanceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    existing = db.query(Ambulance).filter(Ambulance.vehicle_number == payload.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=409, detail="Vehicle number already exists")

    amb = Ambulance(**payload.model_dump())
    db.add(amb)
    db.commit()
    db.refresh(amb)
    return amb


@router.get("/", response_model=List[AmbulanceOut])
def list_ambulances(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Ambulance).filter(Ambulance.is_active == True).all()


@router.get("/{ambulance_id}", response_model=AmbulanceOut)
def get_ambulance(
    ambulance_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb


@router.patch("/{ambulance_id}/location", response_model=AmbulanceOut)
def update_location(
    ambulance_id: UUID,
    payload: AmbulanceLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Called by the driver app every few seconds to push GPS coordinates."""
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    amb.current_lat = payload.lat
    amb.current_lng = payload.lng
    amb.last_ping_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(amb)
    return amb


@router.patch("/{ambulance_id}/status", response_model=AmbulanceOut)
def update_status(
    ambulance_id: UUID,
    payload: AmbulanceStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin, UserRole.dispatcher, UserRole.driver)),
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    amb.status = payload.status
    db.commit()
    db.refresh(amb)
    return amb
