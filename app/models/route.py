from sqlalchemy import Column, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    emergency_id = Column(UUID(as_uuid=True), ForeignKey("emergency_requests.id"), nullable=False)
    ambulance_id = Column(UUID(as_uuid=True), ForeignKey("ambulances.id"), nullable=False)

    # Route data from Maps API
    waypoints = Column(JSON, default=list)      # [{"lat": x, "lng": y}, ...]
    distance_km = Column(Float, nullable=True)
    estimated_minutes = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    emergency = relationship("EmergencyRequest", back_populates="route")
    ambulance = relationship("Ambulance", back_populates="routes")
