from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.emergency_request import Severity, EmergencyStatus


class EmergencyCreate(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=150)
    patient_phone: Optional[str] = None
    description: Optional[str] = None
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None
    severity: Severity = Severity.medium


class EmergencyStatusUpdate(BaseModel):
    status: EmergencyStatus


class EmergencyOut(BaseModel):
    id: UUID
    patient_name: str
    patient_phone: Optional[str]
    description: Optional[str]
    lat: float
    lng: float
    address: Optional[str]
    severity: Severity
    status: EmergencyStatus
    ambulance_id: Optional[UUID]
    hospital_id: Optional[UUID]
    created_at: datetime
    dispatched_at: Optional[datetime]
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
