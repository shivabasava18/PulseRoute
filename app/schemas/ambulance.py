from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.ambulance import AmbulanceStatus


class AmbulanceCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=2, max_length=50)
    driver_id: Optional[UUID] = None
    equipment_notes: Optional[str] = None


class AmbulanceLocationUpdate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class AmbulanceStatusUpdate(BaseModel):
    status: AmbulanceStatus


class AmbulanceOut(BaseModel):
    id: UUID
    vehicle_number: str
    driver_id: Optional[UUID]
    status: AmbulanceStatus
    current_lat: Optional[float]
    current_lng: Optional[float]
    last_ping_at: Optional[datetime]
    equipment_notes: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
