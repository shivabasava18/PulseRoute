from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class HospitalCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    address: str
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    contact_number: Optional[str] = None
    total_beds: int = Field(default=0, ge=0)
    available_beds: int = Field(default=0, ge=0)
    icu_beds: int = Field(default=0, ge=0)
    available_icu_beds: int = Field(default=0, ge=0)
    specialties: List[str] = []


class HospitalBedUpdate(BaseModel):
    available_beds: Optional[int] = Field(None, ge=0)
    available_icu_beds: Optional[int] = Field(None, ge=0)


class HospitalOut(BaseModel):
    id: UUID
    name: str
    address: str
    lat: float
    lng: float
    contact_number: Optional[str]
    total_beds: int
    available_beds: int
    icu_beds: int
    available_icu_beds: int
    specialties: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
