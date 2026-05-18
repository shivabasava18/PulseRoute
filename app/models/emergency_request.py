from sqlalchemy import Column, String, Float, Enum, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    critical = "critical"


class EmergencyStatus(str, enum.Enum):
    pending = "pending"          # just created, awaiting dispatch
    dispatching = "dispatching"  # dispatch algorithm running
    dispatched = "dispatched"    # ambulance assigned
    in_transit = "in_transit"    # ambulance en route
    arrived = "arrived"          # ambulance at scene
    transporting = "transporting"  # patient in ambulance → hospital
    resolved = "resolved"        # case closed
    cancelled = "cancelled"


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Patient info
    patient_name = Column(String(150), nullable=False)
    patient_phone = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)

    # Location of the emergency
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String(400), nullable=True)

    # Classification
    severity = Column(Enum(Severity), nullable=False, default=Severity.medium)
    status = Column(Enum(EmergencyStatus), nullable=False, default=EmergencyStatus.pending)

    # Assignments
    ambulance_id = Column(UUID(as_uuid=True), ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=True)
    requested_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    ambulance = relationship("Ambulance", back_populates="emergency_requests")
    hospital = relationship("Hospital", back_populates="emergency_requests")
    dispatch_logs = relationship("DispatchLog", back_populates="emergency")
    route = relationship("Route", back_populates="emergency", uselist=False)
    notifications = relationship("Notification", back_populates="emergency")
