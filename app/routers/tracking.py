from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from uuid import UUID
import asyncio
import json

from app.database import get_db, SessionLocal
from app.models.emergency_request import EmergencyRequest
from app.models.ambulance import Ambulance
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/tracking", tags=["Tracking"])


@router.get("/{emergency_id}")
def get_tracking_info(
    emergency_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    ambulance = None
    if emergency.ambulance_id:
        ambulance = db.query(Ambulance).filter(Ambulance.id == emergency.ambulance_id).first()

    return {
        "emergency_id": str(emergency.id),
        "status": emergency.status.value,
        "ambulance": {
            "id": str(ambulance.id),
            "vehicle_number": ambulance.vehicle_number,
            "lat": ambulance.current_lat,
            "lng": ambulance.current_lng,
            "last_ping_at": ambulance.last_ping_at.isoformat() if ambulance.last_ping_at else None,
        } if ambulance else None,
        "destination": {
            "lat": emergency.lat,
            "lng": emergency.lng,
            "address": emergency.address,
        },
    }


@router.websocket("/ws/{emergency_id}")
async def tracking_websocket(websocket: WebSocket, emergency_id: str):
    """
    WebSocket endpoint — pushes ambulance location every 3 seconds.
    Connect from the frontend with: new WebSocket('ws://localhost:8000/api/tracking/ws/<id>')
    """
    await websocket.accept()
    try:
        while True:
            db = SessionLocal()
            try:
                emergency = db.query(EmergencyRequest).filter(
                    EmergencyRequest.id == emergency_id
                ).first()

                if not emergency or not emergency.ambulance_id:
                    await websocket.send_text(json.dumps({"status": "waiting_for_dispatch"}))
                else:
                    ambulance = db.query(Ambulance).filter(
                        Ambulance.id == emergency.ambulance_id
                    ).first()
                    await websocket.send_text(json.dumps({
                        "status": emergency.status.value,
                        "ambulance_lat": ambulance.current_lat if ambulance else None,
                        "ambulance_lng": ambulance.current_lng if ambulance else None,
                        "vehicle_number": ambulance.vehicle_number if ambulance else None,
                    }))
            finally:
                db.close()

            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass
