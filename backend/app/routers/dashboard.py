from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, Task, Expense
from ..schemas import DashboardSummaryResponse, EventResponse, TaskResponse
from .events import calculate_stats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.event_date.asc()).all()

    total_planned = sum(e.total_budget for e in events)
    total_committed = sum(e.actual_amount for e in db.query(Expense).all())

    # Tasks due soon (not completed, sorted by due_date)
    upcoming_tasks = (
        db.query(Task)
        .filter(Task.status != "COMPLETED")
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.asc())
        .limit(6)
        .all()
    )

    event_summaries = []
    for e in events:
        resp = EventResponse.model_validate(e)
        resp.stats = calculate_stats(e)
        event_summaries.append(resp)

    return DashboardSummaryResponse(
        total_events=len(events),
        total_planned_spending=total_planned,
        total_committed_spending=total_committed,
        tasks_due_soon=[TaskResponse.model_validate(t) for t in upcoming_tasks],
        upcoming_events=event_summaries
    )
