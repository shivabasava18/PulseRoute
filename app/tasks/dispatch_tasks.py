from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.services.dispatch_service import auto_dispatch
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def dispatch_emergency_task(self, emergency_id: str, dispatcher_id: str = None):
    """
    Celery task version of auto_dispatch.
    Use this when you need retries, delayed dispatch, or queue priority.
    The router uses BackgroundTasks for simplicity — swap to this task
    when you need Celery's retry/queue features in production.
    """
    db = SessionLocal()
    try:
        result = auto_dispatch(db, emergency_id=emergency_id, dispatcher_id=dispatcher_id)
        if not result["success"]:
            logger.error("Dispatch failed for emergency %s: %s", emergency_id, result.get("error"))
            raise self.retry(exc=Exception(result.get("error")))
        return result
    except Exception as exc:
        logger.exception("Dispatch task error for emergency %s", emergency_id)
        raise self.retry(exc=exc)
    finally:
        db.close()
