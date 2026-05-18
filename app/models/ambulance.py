from sqlalchemy import Column, String, Float, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


class AmbulanceStatus(str, enum.Enum):
    available = "available"
    dispatched = "dispatched"
    in_transit = "in_transit"
    maintenance = "maintenance"
    offline = "offline"


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_number = Column(String(50), unique=True, nullable=False, index=True)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(Enum(AmbulanceStatus), default=AmbulanceStatus.available, nullable=False)

    # Live GPS coordinates
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    last_ping_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    equipment_notes = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    driver = relationship("User", back_populates="ambulance")
    emergency_requests = relationship("EmergencyRequest", back_populates="ambulance")
    dispatch_logs = relationship("DispatchLog", back_populates="ambulance")
    routes = relationship("Route", back_populates="ambulance")
