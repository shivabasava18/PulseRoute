from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.hospital import Hospital
from app.models.user import UserRole, User
from app.schemas.hospital import HospitalCreate, HospitalOut, HospitalBedUpdate
from app.dependencies import get_current_user, require_role
from app.utils.geo import haversine

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])


@router.post("/", response_model=HospitalOut, status_code=201)
def create_hospital(
    payload: HospitalCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    hospital = Hospital(**payload.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.get("/", response_model=List[HospitalOut])
def list_hospitals(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Hospital).all()


@router.get("/nearest", response_model=List[HospitalOut])
def nearest_hospitals(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    limit: int = Query(5, le=20),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return up to `limit` hospitals with available beds, sorted by distance."""
    hospitals = db.query(Hospital).filter(Hospital.available_beds > 0).all()
    ranked = sorted(hospitals, key=lambda h: haversine(lat, lng, h.lat, h.lng))
    return ranked[:limit]


@router.patch("/{hospital_id}/beds", response_model=HospitalOut)
def update_beds(
    hospital_id: UUID,
    payload: HospitalBedUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin, UserRole.hospital_staff)),
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if payload.available_beds is not None:
        hospital.available_beds = payload.available_beds
    if payload.available_icu_beds is not None:
        hospital.available_icu_beds = payload.available_icu_beds

    db.commit()
    db.refresh(hospital)
    return hospital
