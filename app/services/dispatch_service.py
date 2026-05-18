"""
Smart Dispatch Algorithm
------------------------
Scores every available ambulance using three factors:
  1. Distance (km)   — 60% weight
  2. Status priority — 10% weight (available beats in_transit)
  3. Last ping age   — 30% weight (recently pinged = reliable GPS)

Lower score = better candidate.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.emergency_request import EmergencyRequest, EmergencyStatus
from app.models.hospital import Hospital
from app.models.dispatch_log import DispatchLog
from app.models.route import Route
from app.utils.geo import haversine
import logging

logger = logging.getLogger(__name__)


def _score_ambulance(ambulance: Ambulance, emergency_lat: float, emergency_lng: float) -> float:
    """Lower score = better. Returns float('inf') if ambulance cannot be scored."""
    if ambulance.current_lat is None or ambulance.current_lng is None:
        return float("inf")

    distance_km = haversine(
        ambulance.current_lat, ambulance.current_lng,
        emergency_lat, emergency_lng,
    )

    # Staleness penalty: subtract score for each minute without a GPS ping
    staleness_minutes = 0.0
    if ambulance.last_ping_at:
        now = datetime.now(timezone.utc)
        ping = ambulance.last_ping_at
        if ping.tzinfo is None:
            ping = ping.replace(tzinfo=timezone.utc)
        staleness_minutes = (now - ping).total_seconds() / 60

    # Status factor: available ambulances are strongly preferred
    status_penalty = 0 if ambulance.status == AmbulanceStatus.available else 5.0

    score = (distance_km * 0.6) + (staleness_minutes * 0.3) + (status_penalty * 0.1)
    return score


def find_best_ambulance(db: Session, emergency: EmergencyRequest) -> Optional[Ambulance]:
    """Query all available ambulances and return the best one by score."""
    candidates = (
        db.query(Ambulance)
        .filter(
            Ambulance.is_active == True,
            Ambulance.status.in_([AmbulanceStatus.available]),
        )
        .all()
    )

    if not candidates:
        logger.warning("No available ambulances for emergency %s", emergency.id)
        return None

    scored = [(amb, _score_ambulance(amb, emergency.lat, emergency.lng)) for amb in candidates]
    scored.sort(key=lambda x: x[1])
    best, best_score = scored[0]

    if best_score == float("inf"):
        logger.warning("All ambulances lack GPS data for emergency %s", emergency.id)
        return None

    logger.info(
        "Best ambulance for emergency %s → %s (score=%.2f)",
        emergency.id, best.vehicle_number, best_score,
    )
    return best


def find_best_hospital(db: Session, emergency: EmergencyRequest) -> Optional[Hospital]:
    """Return nearest hospital with at least one available bed."""
    hospitals = db.query(Hospital).filter(Hospital.available_beds > 0).all()

    if not hospitals:
        logger.warning("No hospitals with available beds for emergency %s", emergency.id)
        return None

    ranked = sorted(
        hospitals,
        key=lambda h: haversine(emergency.lat, emergency.lng, h.lat, h.lng),
    )
    return ranked[0]


def auto_dispatch(db: Session, emergency_id: UUID, dispatcher_id: Optional[UUID] = None) -> dict:
    """
    Full dispatch pipeline:
      1. Find best ambulance
      2. Find nearest hospital
      3. Assign both to the emergency
      4. Update ambulance status
      5. Write dispatch log
      6. Create a placeholder route
    Returns a result dict with success status.
    """
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        return {"success": False, "error": "Emergency not found"}

    # Mark as dispatching so duplicate tasks are skipped
    emergency.status = EmergencyStatus.dispatching
    db.commit()

    ambulance = find_best_ambulance(db, emergency)
    hospital = find_best_hospital(db, emergency)

    if not ambulance:
        emergency.status = EmergencyStatus.pending
        db.commit()
        return {"success": False, "error": "No available ambulances"}

    # Assign
    emergency.ambulance_id = ambulance.id
    emergency.hospital_id = hospital.id if hospital else None
    emergency.status = EmergencyStatus.dispatched
    emergency.dispatched_at = datetime.now(timezone.utc)

    # Update ambulance status
    ambulance.status = AmbulanceStatus.dispatched

    # Write audit log
    log = DispatchLog(
        emergency_id=emergency.id,
        ambulance_id=ambulance.id,
        dispatcher_id=dispatcher_id,
        action="auto_dispatched",
        notes=f"Ambulance {ambulance.vehicle_number} dispatched to emergency.",
    )
    db.add(log)

    # Create a stub route (waypoints filled by maps_service in Phase 2)
    route = Route(
        emergency_id=emergency.id,
        ambulance_id=ambulance.id,
        waypoints=[
            {"lat": ambulance.current_lat, "lng": ambulance.current_lng},
            {"lat": emergency.lat, "lng": emergency.lng},
        ],
    )
    db.add(route)
    db.commit()
    db.refresh(emergency)

    return {
        "success": True,
        "emergency_id": str(emergency.id),
        "ambulance_id": str(ambulance.id),
        "ambulance_vehicle": ambulance.vehicle_number,
        "hospital_id": str(hospital.id) if hospital else None,
        "hospital_name": hospital.name if hospital else None,
    }
