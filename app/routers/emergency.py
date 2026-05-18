from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.emergency_request import EmergencyRequest, EmergencyStatus
from app.models.user import UserRole, User
from app.schemas.emergency import EmergencyCreate, EmergencyOut, EmergencyStatusUpdate
from app.dependencies import get_current_user, require_role
from app.services.dispatch_service import auto_dispatch

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])


@router.post("/", response_model=EmergencyOut, status_code=201)
def create_emergency(
    payload: EmergencyCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new emergency request.
    Dispatch runs in the background so this endpoint responds immediately.
    """
    emergency = EmergencyRequest(
        **payload.model_dump(),
        requested_by_id=current_user.id,
    )
    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    # Fire-and-forget dispatch in background
    background_tasks.add_task(
        auto_dispatch,
        db=db,
        emergency_id=emergency.id,
        dispatcher_id=current_user.id,
    )

    return emergency


@router.get("/", response_model=List[EmergencyOut])
def list_emergencies(
    status: EmergencyStatus = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin, UserRole.dispatcher)),
):
    query = db.query(EmergencyRequest)
    if status:
        query = query.filter(EmergencyRequest.status == status)
    return query.order_by(EmergencyRequest.created_at.desc()).limit(100).all()


@router.get("/{emergency_id}", response_model=EmergencyOut)
def get_emergency(
    emergency_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency


@router.patch("/{emergency_id}/status", response_model=EmergencyOut)
def update_emergency_status(
    emergency_id: UUID,
    payload: EmergencyStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin, UserRole.dispatcher, UserRole.driver)),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    emergency.status = payload.status
    db.commit()
    db.refresh(emergency)
    return emergency
