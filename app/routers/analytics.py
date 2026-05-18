from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.emergency_request import EmergencyRequest, EmergencyStatus, Severity
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.hospital import Hospital
from app.dependencies import require_role
from app.models.user import UserRole, User

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin, UserRole.dispatcher)),
):
    total_emergencies = db.query(EmergencyRequest).count()
    pending = db.query(EmergencyRequest).filter(EmergencyRequest.status == EmergencyStatus.pending).count()
    active = db.query(EmergencyRequest).filter(
        EmergencyRequest.status.in_([EmergencyStatus.dispatched, EmergencyStatus.in_transit, EmergencyStatus.transporting])
    ).count()
    resolved = db.query(EmergencyRequest).filter(EmergencyRequest.status == EmergencyStatus.resolved).count()

    critical = db.query(EmergencyRequest).filter(EmergencyRequest.severity == Severity.critical).count()
    medium = db.query(EmergencyRequest).filter(EmergencyRequest.severity == Severity.medium).count()
    low = db.query(EmergencyRequest).filter(EmergencyRequest.severity == Severity.low).count()

    total_ambulances = db.query(Ambulance).filter(Ambulance.is_active == True).count()
    available_ambulances = db.query(Ambulance).filter(
        Ambulance.is_active == True,
        Ambulance.status == AmbulanceStatus.available
    ).count()

    total_beds = db.query(func.sum(Hospital.total_beds)).scalar() or 0
    available_beds = db.query(func.sum(Hospital.available_beds)).scalar() or 0

    return {
        "emergencies": {
            "total": total_emergencies,
            "pending": pending,
            "active": active,
            "resolved": resolved,
        },
        "by_severity": {
            "critical": critical,
            "medium": medium,
            "low": low,
        },
        "ambulances": {
            "total": total_ambulances,
            "available": available_ambulances,
            "busy": total_ambulances - available_ambulances,
        },
        "hospitals": {
            "total_beds": total_beds,
            "available_beds": available_beds,
            "occupancy_rate": round((1 - available_beds / total_beds) * 100, 1) if total_beds > 0 else 0,
        },
    }
