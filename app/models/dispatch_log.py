from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    emergency_id = Column(UUID(as_uuid=True), ForeignKey("emergency_requests.id"), nullable=False)
    ambulance_id = Column(UUID(as_uuid=True), ForeignKey("ambulances.id"), nullable=True)
    dispatcher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    action = Column(String(100), nullable=False)  # "auto_dispatched", "manual_override", "reassigned"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    emergency = relationship("EmergencyRequest", back_populates="dispatch_logs")
    ambulance = relationship("Ambulance", back_populates="dispatch_logs")
